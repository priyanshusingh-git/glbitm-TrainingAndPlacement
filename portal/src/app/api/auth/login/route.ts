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
  username: z.string().optional(),
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
  const { email, password, rememberMe, username, hcaptchaToken } = parsed.data;

  // Bot honeypot
  if (username) {
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
  if (captchaRequired) {
    if (!hcaptchaToken) {
      return createProblemResponse(req, { status: 400, code: "CAPTCHA_REQUIRED", title: "Captcha required", detail: "Please complete the captcha challenge." });
    }
    if (!(await verifyHCaptchaToken({ token: hcaptchaToken, ip }))) {
      return createProblemResponse(req, { status: 400, code: "CAPTCHA_REQUIRED", title: "Captcha required", detail: "Captcha verification failed. Please try again." });
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
        studentProfile: {
          select: { name: true, photoUrl: true },
        },
      },
    });

    // Check generic Auth Failure
    if (!user || !user.password) {
      const failure = await recordLoginFailure({ ip, email, fingerprint });
      await logAuthEvent({ action: "LOGIN_FAILED", ip, email, userAgent, fingerprint, metadata: { reason: "user_not_found_or_no_password" } });
      await applyProgressiveDelay(failure.emailFailureCount);
      return createProblemResponse(req, { status: 401, code: "AUTH_FAILED", title: "Authentication failed", detail: "Invalid email or password.", extensions: { captchaRequired: failure.captchaRequired } });
    }

    // Mathematically compare password logic (replaces Firebase API)
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    // For local dev convenience if they imported legacy users lacking hash via FIREBASE_AUTH placeholder
    if (!passwordMatch && user.password !== "FIREBASE_AUTH") {
      const failure = await recordLoginFailure({ ip, email, fingerprint });
      await logAuthEvent({ action: "LOGIN_FAILED", ip, email, userAgent, fingerprint, metadata: { reason: "invalid_password" } });
      await applyProgressiveDelay(failure.emailFailureCount);
      return createProblemResponse(req, { status: 401, code: "AUTH_FAILED", title: "Authentication failed", detail: "Invalid email or password.", extensions: { captchaRequired: failure.captchaRequired } });
    } else if (user.password === "FIREBASE_AUTH") {
        // Technically a zombie Firebase user trying to login - cannot happen since we established zero users exist.
        return createProblemResponse(req, { status: 401, code: "AUTH_FAILED", title: "Authentication failed", detail: "Account has been migrated forcefully. Please reset your password." });
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
