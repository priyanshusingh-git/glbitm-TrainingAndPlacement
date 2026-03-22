import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/db"
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
import { createRoleBoundIdToken } from "@/lib/auth-claims"
import { validateCsrfToken } from "@/lib/csrf"
import { signInWithEmailAndPasswordServer } from "@/lib/firebase-rest"
import { verifyHCaptchaToken } from "@/lib/hcaptcha"
import { attachRequestContextHeaders, getIpAddress, getUserAgent } from "@/lib/request-context"
import { getDashboardPath } from "@/lib/role-cookie"
import { applySessionCookies, createSessionCookies } from "@/lib/session"
import { createProblemResponse, handleApiError } from "@/lib/problem-details"
import { sendSecurityAlertEmail } from "@/services/email.service"

const loginSchema = z.object({
  email: z.string().email().max(255).transform((value) => value.trim().toLowerCase()),
  password: z.string().min(8).max(128),
  role: z.enum(["STUDENT", "ADMIN", "TRAINER", "RECRUITER"]),
  rememberMe: z.boolean().optional().default(false),
  username: z.string().optional(),
  fingerprint: z.string().min(8).max(64).optional(),
  hcaptchaToken: z.string().min(1).optional(),
  csrfToken: z.string().length(64).optional(),
})

const FIREBASE_AUTH_FAILURES = new Set([
  "EMAIL_NOT_FOUND",
  "INVALID_LOGIN_CREDENTIALS",
  "INVALID_PASSWORD",
  "USER_DISABLED",
  "FIREBASE_SIGN_IN_FAILED",
])

function isCredentialFailure(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  return FIREBASE_AUTH_FAILURES.has(message)
}

export async function POST(req: NextRequest) {
  const ip = getIpAddress(req)
  const userAgent = getUserAgent(req)

  const body = await req.json().catch(() => null)
  const parsed = loginSchema.safeParse(body)

  if (!parsed.success) {
    return createProblemResponse(req, {
      status: 400,
      code: "AUTH_FAILED",
      title: "Authentication failed",
      detail: "Invalid email or password.",
    })
  }

  const csrfToken = parsed.data.csrfToken ?? req.headers.get("x-csrf-token")
  const fingerprint = parsed.data.fingerprint?.trim().slice(0, 64) || null
  const { email, password, role, rememberMe, username, hcaptchaToken } = parsed.data

  if (username) {
    await logAuthEvent({
      action: "BOT_HONEYPOT",
      ip,
      email,
      userAgent,
      fingerprint,
      metadata: {
        selectedRole: role,
      },
    })
    return attachRequestContextHeaders(req, NextResponse.json({ success: true }))
  }

  if (!(await validateCsrfToken(req, csrfToken))) {
    return createProblemResponse(req, {
      status: 403,
      code: "CSRF_INVALID",
      title: "Security validation failed",
      detail: "Security validation failed.",
    })
  }

  const blockedIp = await isIpBlocked(ip)
  if (blockedIp.blocked) {
    const response = createProblemResponse(req, {
      status: 429,
      code: "RATE_LIMITED",
      title: "Too many requests",
      detail: "Too many attempts from your network. Try again later.",
      extensions: {
        retryAfter: blockedIp.retryAfter,
      },
      headers: {
        "Retry-After": String(blockedIp.retryAfter),
      },
    })
    applyRateLimitHeaders(response, {}, blockedIp.retryAfter)
    await logAuthEvent({
      action: "RATE_LIMITED",
      ip,
      email,
      userAgent,
      fingerprint,
      metadata: {
        endpoint: "/api/auth/login",
        limitType: "blocked_ip",
        retryAfter: blockedIp.retryAfter,
      },
    })
    return response
  }

  const credentialStuffing = await trackCredentialStuffing(ip, email)
  if (credentialStuffing.blocked) {
    const retryAfter = 24 * 60 * 60
    const response = createProblemResponse(req, {
      status: 429,
      code: "RATE_LIMITED",
      title: "Too many requests",
      detail: "Too many attempts from your network. Try again later.",
      extensions: {
        retryAfter,
      },
      headers: {
        "Retry-After": String(retryAfter),
      },
    })
    applyRateLimitHeaders(response, {}, retryAfter)
    await logAuthEvent({
      action: "CREDENTIAL_STUFFING",
      ip,
      email,
      userAgent,
      fingerprint,
      metadata: {
        uniqueEmails: credentialStuffing.uniqueEmails,
      },
    })
    void sendSecurityAlertEmail({
      ip,
      uniqueEmails: credentialStuffing.uniqueEmails,
      userAgent,
    })
    return response
  }

  const ipLimit = await loginIpLimiter.limit(ip)
  const comboLimit = await loginComboLimiter.limit(`${ip}:${email}`)
  const fingerprintLimit = fingerprint
    ? await loginFingerprintLimiter.limit(fingerprint)
    : null

  if (!ipLimit.success || !comboLimit.success || (fingerprintLimit && !fingerprintLimit.success)) {
    const rateLimitResult =
      !ipLimit.success ? ipLimit : !comboLimit.success ? comboLimit : fingerprintLimit!
    const retryAfter = Math.max(
      1,
      Math.ceil((Number(rateLimitResult.reset ?? Date.now()) - Date.now()) / 1000)
    )
    const response = createProblemResponse(req, {
      status: 429,
      code: "RATE_LIMITED",
      title: "Too many requests",
      detail: "Too many attempts from your network. Try again later.",
      extensions: {
        retryAfter,
      },
      headers: {
        "Retry-After": String(retryAfter),
      },
    })
    applyRateLimitHeaders(response, rateLimitResult, retryAfter)
    await logAuthEvent({
      action: "RATE_LIMITED",
      ip,
      email,
      userAgent,
      fingerprint,
      metadata: {
        endpoint: "/api/auth/login",
        limitType: !ipLimit.success
          ? "ip"
          : !comboLimit.success
            ? "ip_email_combo"
            : "fingerprint",
        retryAfter,
      },
    })
    return response
  }

  const captchaRequired = await isCaptchaRequired(ip)
  if (captchaRequired) {
    if (!hcaptchaToken) {
      return createProblemResponse(req, {
        status: 400,
        code: "CAPTCHA_REQUIRED",
        title: "Captcha required",
        detail: "Please complete the captcha challenge.",
        extensions: {
          captchaRequired: true,
        },
      })
    }

    if (!(await verifyHCaptchaToken({ token: hcaptchaToken, ip }))) {
      return createProblemResponse(req, {
        status: 400,
        code: "CAPTCHA_REQUIRED",
        title: "Captcha required",
        detail: "Captcha verification failed. Please try again.",
        extensions: {
          captchaRequired: true,
        },
      })
    }
  }

  try {
    const signInResult = await signInWithEmailAndPasswordServer({ email, password })
    const user = await prisma.user.findUnique({
      where: { id: signInResult.localId },
      select: {
        id: true,
        email: true,
        role: true,
        isSuspended: true,
        suspendedReason: true,
        mustChangePassword: true,
        studentProfile: {
          select: {
            name: true,
            photoUrl: true,
          },
        },
      },
    })

    if (!user) {
      const failure = await recordLoginFailure({ ip, email, fingerprint })
      await logAuthEvent({
        action: "LOGIN_FAILED",
        ip,
        email,
        userAgent,
        fingerprint,
        metadata: {
          reason: "user_not_in_database",
          failCount: failure.emailFailureCount,
          ipFailCount: failure.ipFailureCount,
        },
      })
      await applyProgressiveDelay(failure.emailFailureCount)

      return createProblemResponse(req, {
        status: 401,
        code: "AUTH_FAILED",
        title: "Authentication failed",
        detail: "Invalid email or password.",
        extensions: {
          captchaRequired: failure.captchaRequired,
        },
      })
    }

    if (user.isSuspended) {
      await logAuthEvent({
        action: "ACCOUNT_SUSPENDED",
        ip,
        userId: user.id,
        email,
        userAgent,
        fingerprint,
        metadata: {
          reason: user.suspendedReason || "manual_or_system_suspension",
        },
      })

      return createProblemResponse(req, {
        status: 403,
        code: "ACCOUNT_SUSPENDED",
        title: "Access denied",
        detail:
          user.suspendedReason || "Your account has been suspended. Contact the T&P office.",
      })
    }

    const roleBoundToken = await createRoleBoundIdToken({
      uid: user.id,
      role: user.role as "ADMIN" | "STUDENT" | "TRAINER" | "RECRUITER",
      mustChangePassword: user.mustChangePassword,
    })

    if (roleBoundToken.role !== role) {
      const failure = await recordLoginFailure({ ip, email, fingerprint })
      await logAuthEvent({
        action: "LOGIN_ROLE_MISMATCH",
        ip,
        userId: user.id,
        email,
        userAgent,
        fingerprint,
        metadata: {
          selectedRole: role,
          actualRole: roleBoundToken.role,
          failCount: failure.emailFailureCount,
        },
      })
      await applyProgressiveDelay(failure.emailFailureCount)

      return createProblemResponse(req, {
        status: 401,
        code: "ROLE_MISMATCH",
        title: "Authentication failed",
        detail: "Invalid credentials for this role.",
        extensions: {
          captchaRequired: failure.captchaRequired,
        },
      })
    }

    await clearLoginFailures({ ip, email, fingerprint })

    const cookieData = await createSessionCookies({
      idToken: roleBoundToken.idToken,
      uid: user.id,
      role: roleBoundToken.role,
      mustChangePassword: roleBoundToken.mustChangePassword,
      rememberMe,
    })

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: roleBoundToken.role,
        mustChangePassword: roleBoundToken.mustChangePassword,
        name: user.studentProfile?.name,
        photoUrl: user.studentProfile?.photoUrl,
      },
      redirectUrl: roleBoundToken.mustChangePassword
        ? "/change-password"
        : getDashboardPath(roleBoundToken.role),
    })

    applySessionCookies(response, {
      ...cookieData,
      rememberMe,
    })
    await Promise.all([
      logAuthEvent({
        action: "LOGIN_SUCCESS",
        ip,
        userId: user.id,
        email,
        userAgent,
        fingerprint,
        metadata: {
          role: user.role,
        },
      }),
      logAuthEvent({
        action: "SESSION_CREATED",
        ip,
        userId: user.id,
        email,
        userAgent,
        fingerprint,
        metadata: {
          role: user.role,
          rememberMe,
          expiresInSeconds: cookieData.maxAge,
        },
      }),
    ])

    return attachRequestContextHeaders(req, response)
  } catch (error) {
    if (isCredentialFailure(error)) {
      const failure = await recordLoginFailure({ ip, email, fingerprint })
      await logAuthEvent({
        action: "LOGIN_FAILED",
        ip,
        email,
        userAgent,
        fingerprint,
        metadata: {
          reason: error instanceof Error ? error.message : "firebase_sign_in_failed",
          failCount: failure.emailFailureCount,
          ipFailCount: failure.ipFailureCount,
        },
      })
      await applyProgressiveDelay(failure.emailFailureCount)

      return createProblemResponse(req, {
        status: 401,
        code: "AUTH_FAILED",
        title: "Authentication failed",
        detail: "Invalid email or password.",
        extensions: {
          captchaRequired: failure.captchaRequired,
        },
      })
    }

    return handleApiError(req, error, {
      event: "auth.login.unexpected_failure",
      message: "Login failed unexpectedly",
      context: {
        email,
        role,
        ip,
      },
    })
  }
}
