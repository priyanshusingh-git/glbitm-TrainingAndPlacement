import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/db"
import bcrypt from "bcryptjs"
import {
  applyProgressiveDelay,
  applyRateLimitHeaders,
  clearLoginFailures,
  isCaptchaRequired,
  isIpBlocked,
  loginComboLimiter,
  loginFingerprintLimiter,
  loginIpLimiter,
  recordLoginFailure,
  trackCredentialStuffing,
} from "@/lib/auth-rate-limit"
import { logAuthEvent } from "@/lib/auth-audit"
import { validateCsrfToken } from "@/lib/csrf"
import { verifyHCaptchaToken } from "@/lib/hcaptcha"
import { attachRequestContextHeaders, getIpAddress, getUserAgent } from "@/lib/request-context"
import { getDashboardPath } from "@/lib/role-cookie"
import { applySessionCookies, createSessionCookies } from "@/lib/session"
import { createProblemResponse, handleApiError } from "@/lib/problem-details"
import { sendSecurityAlertEmail } from "@/services/email.service"

const loginSchema = z.object({
  email: z.string().email().max(255).transform((value) => value.trim().toLowerCase()),
  password: z.string().min(8).max(128),
  role: z.enum(["STUDENT", "ADMIN", "TRAINER", "RECRUITER"]).optional(), // Auto-detected from DB
  rememberMe: z.boolean().optional().default(false),
  website: z.string().optional(),
  fingerprint: z.string().min(8).max(64).optional(),
  hcaptchaToken: z.string().min(1).optional(),
  csrfToken: z.string().length(64).optional(),
})

export async function POST(req: NextRequest) {
  const ip = getIpAddress(req);
  const userAgent = getUserAgent(req);

  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return createProblemResponse(req, {
      status: 400,
      code: "AUTH_FAILED",
      title: "Authentication failed",
      detail: "Invalid email or password.",
    });
  }

  const csrfToken = parsed.data.csrfToken ?? req.headers.get("x-csrf-token");
  const fingerprint = parsed.data.fingerprint?.trim().slice(0, 64) || null;
  const { email, password, rememberMe, website, hcaptchaToken } = parsed.data;

  // Bot honeypot
  if (website) {
    await logAuthEvent({
      action: "BOT_HONEYPOT",
      ip, email, userAgent, fingerprint,
      metadata: { selectedRole: "auto" },
    });
    return attachRequestContextHeaders(req, NextResponse.json({ success: true }));
  }

  if (!(await validateCsrfToken(req, csrfToken))) {
    return createProblemResponse(req, {
      status: 403,
      code: "CSRF_INVALID",
      title: "Security validation failed",
      detail: "Security validation failed.",
    });
  }

  const blockedIp = await isIpBlocked(ip);
  if (blockedIp.blocked) {
    const response = createProblemResponse(req, {
      status: 429,
      code: "RATE_LIMITED",
      title: "Too many requests",
      detail: "Too many attempts from your network. Try again later.",
      extensions: { retryAfter: blockedIp.retryAfter },
      headers: { "Retry-After": String(blockedIp.retryAfter) },
    });
    applyRateLimitHeaders(response, {}, blockedIp.retryAfter);
    await logAuthEvent({ action: "RATE_LIMITED", ip, email, userAgent, fingerprint, metadata: { endpoint: "/api/auth/login", limitType: "blocked_ip" } });
    return response;
  }

  const credentialStuffing = await trackCredentialStuffing(ip, email);
  if (credentialStuffing.blocked) {
    const retryAfter = 24 * 60 * 60;
    const response = createProblemResponse(req, {
      status: 429,
      code: "RATE_LIMITED",
      title: "Too many requests",
      detail: "Too many attempts from your network. Try again later.",
      extensions: { retryAfter },
      headers: { "Retry-After": String(retryAfter) },
    });
    applyRateLimitHeaders(response, {}, retryAfter);
    await logAuthEvent({ action: "CREDENTIAL_STUFFING", ip, email, userAgent, fingerprint, metadata: { uniqueEmails: credentialStuffing.uniqueEmails } });
    void sendSecurityAlertEmail({ ip, uniqueEmails: credentialStuffing.uniqueEmails, userAgent });
    return response;
  }

  const ipLimit = await loginIpLimiter.limit(ip);
  const comboLimit = await loginComboLimiter.limit(`${ip}:${email}`);
  const fingerprintLimit = fingerprint ? await loginFingerprintLimiter.limit(fingerprint) : null;

  if (!ipLimit.success || !comboLimit.success || (fingerprintLimit && !fingerprintLimit.success)) {
    const rateLimitResult = !ipLimit.success ? ipLimit : !comboLimit.success ? comboLimit : fingerprintLimit!;
    const retryAfter = Math.max(1, Math.ceil((Number(rateLimitResult.reset ?? Date.now()) - Date.now()) / 1000));
    const response = createProblemResponse(req, {
      status: 429,
      code: "RATE_LIMITED",
      title: "Too many requests",
      detail: "Too many attempts from your network. Try again later.",
      extensions: { retryAfter },
      headers: { "Retry-After": String(retryAfter) },
    });
    applyRateLimitHeaders(response, rateLimitResult, retryAfter);
    await logAuthEvent({ action: "RATE_LIMITED", ip, email, userAgent, fingerprint, metadata: { endpoint: "/api/auth/login" } });
    return response;
  }

    const captchaRequired = await isCaptchaRequired(ip);
    if (captchaRequired && process.env.HCAPTCHA_SECRET_KEY) {
      if (!hcaptchaToken) {
        return createProblemResponse(req, { 
          status: 401, 
          code: "CAPTCHA_REQUIRED", 
          title: "CAPTCHA required", 
          detail: "Please complete the security challenge to continue." 
        });
      }
      if (!(await verifyHCaptchaToken({ token: hcaptchaToken, ip }))) {
        return createProblemResponse(req, { 
          status: 401, 
          code: "CAPTCHA_REQUIRED", 
          title: "CAPTCHA required", 
          detail: "CAPTCHA verification failed. Please try again." 
        });
      }
    }

  try {
    // -------------------------------------------------------------------------------- //
    // NEW NATIVE POSTGRES DATABASE LOOKUP 
    // -------------------------------------------------------------------------------- //
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true, // we need the hash!
        role: true,
        isSuspended: true,
        suspendedReason: true,
        mustChangePassword: true,
        sessionVersion: true,
        studentProfile: {
          select: { name: true, photoUrl: true },
        },
      },
    });

    // Compare password hash (or run dummy bcrypt compare if user/password is missing to normalize timing)
    const DUMMY_HASH = "$2a$10$wT8e1S5fJ/qYyJ9kG8/7e.Z7k3j9v4m5n6o7p8q9r0s1t2u3v4w5x"
    const passwordMatch = user?.password
      ? await bcrypt.compare(password, user.password)
      : await bcrypt.compare(password, DUMMY_HASH).then(() => false)

    if (!user || !user.password || !passwordMatch) {
      const failure = await recordLoginFailure({ ip, email, fingerprint })
      await logAuthEvent({
        action: "LOGIN_FAILED",
        ip, email, userAgent, fingerprint,
        metadata: { reason: !user ? "user_not_found" : !user.password ? "no_password" : "invalid_password" }
      })
      await applyProgressiveDelay(failure.emailFailureCount)

      // If user exists and is pending induction, return setup guidance after recording failure
      if (user && user.mustChangePassword) {
        return createProblemResponse(req, {
          status: 401,
          code: "INDUCTION_PENDING",
          title: "Setup Required",
          detail: "It looks like you haven't finished your account setup. Please check your email for your induction link.",
          extensions: { captchaRequired: failure.captchaRequired }
        })
      }

      return createProblemResponse(req, {
        status: 401,
        code: "AUTH_FAILED",
        title: "Authentication failed",
        detail: "Invalid email or password.",
        extensions: { captchaRequired: failure.captchaRequired }
      })
    }

    if (user.isSuspended) {
      await logAuthEvent({ action: "ACCOUNT_SUSPENDED", ip, userId: user.id, email, userAgent, fingerprint, metadata: { reason: user.suspendedReason || "manual_or_system_suspension" } });
      return createProblemResponse(req, { status: 403, code: "ACCOUNT_SUSPENDED", title: "Access denied", detail: user.suspendedReason || "Your account has been suspended. Contact the T&P office." });
    }

    // Role is auto-detected from the database — no mismatch check needed

    await clearLoginFailures({ ip, email, fingerprint });

    // Generate strict Session Native JWT
    const cookieData = await createSessionCookies({
      uid: user.id,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
      sessionVersion: user.sessionVersion,
      rememberMe,
    });

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
        name: user.studentProfile?.name,
        photoUrl: user.studentProfile?.photoUrl,
      },
      redirectUrl: user.mustChangePassword ? "/change-password" : getDashboardPath(user.role),
    });

    applySessionCookies(response, {
      ...cookieData,
      rememberMe,
    });

    await Promise.all([
      logAuthEvent({ action: "LOGIN_SUCCESS", ip, userId: user.id, email, userAgent, fingerprint, metadata: { role: user.role } }),
      logAuthEvent({ action: "SESSION_CREATED", ip, userId: user.id, email, userAgent, fingerprint, metadata: { role: user.role, rememberMe, expiresInSeconds: cookieData.maxAge } }),
    ]);

    return attachRequestContextHeaders(req, response);
  } catch (error) {
    return handleApiError(req, error, {
      event: "auth.login.unexpected_failure",
      message: "Login failed unexpectedly",
      context: { email, ip },
    });
  }
}
