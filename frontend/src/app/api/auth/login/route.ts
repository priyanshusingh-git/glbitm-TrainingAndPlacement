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
import { validateCsrfToken } from "@/lib/csrf"
import { signInWithEmailAndPasswordServer } from "@/lib/firebase-rest"
import { verifyHCaptchaToken } from "@/lib/hcaptcha"
import { getIpAddress, getUserAgent } from "@/lib/request-context"
import { getDashboardPath } from "@/lib/role-cookie"
import { applySessionCookies, createSessionCookies } from "@/lib/session"

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

export async function POST(req: NextRequest) {
  const ip = getIpAddress(req)
  const userAgent = getUserAgent(req)

  const body = await req.json().catch(() => null)
  const parsed = loginSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid email or password.", code: "AUTH_FAILED" },
      { status: 400 }
    )
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
    return NextResponse.json({ success: true })
  }

  if (!(await validateCsrfToken(req, csrfToken))) {
    return NextResponse.json(
      { error: "Security validation failed.", code: "CSRF_INVALID" },
      { status: 403 }
    )
  }

  const blockedIp = await isIpBlocked(ip)
  if (blockedIp.blocked) {
    const response = NextResponse.json(
      {
        error: "Too many attempts from your network. Try again later.",
        code: "RATE_LIMITED",
        retryAfter: blockedIp.retryAfter,
      },
      { status: 429 }
    )
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
    const response = NextResponse.json(
      {
        error: "Too many attempts from your network. Try again later.",
        code: "RATE_LIMITED",
        retryAfter,
      },
      { status: 429 }
    )
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
    const response = NextResponse.json(
      {
        error: "Too many attempts from your network. Try again later.",
        code: "RATE_LIMITED",
        retryAfter,
      },
      { status: 429 }
    )
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
      return NextResponse.json(
        {
          error: "Please complete the captcha challenge.",
          code: "CAPTCHA_REQUIRED",
          captchaRequired: true,
        },
        { status: 400 }
      )
    }

    if (!(await verifyHCaptchaToken({ token: hcaptchaToken, ip }))) {
      return NextResponse.json(
        {
          error: "Captcha verification failed. Please try again.",
          code: "CAPTCHA_REQUIRED",
          captchaRequired: true,
        },
        { status: 400 }
      )
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

      return NextResponse.json(
        {
          error: "Invalid email or password.",
          code: "AUTH_FAILED",
          captchaRequired: failure.captchaRequired,
        },
        { status: 401 }
      )
    }

    if (user.role !== role) {
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
          actualRole: user.role,
          failCount: failure.emailFailureCount,
        },
      })
      await applyProgressiveDelay(failure.emailFailureCount)

      return NextResponse.json(
        {
          error: "Invalid credentials for this role.",
          code: "ROLE_MISMATCH",
          captchaRequired: failure.captchaRequired,
        },
        { status: 401 }
      )
    }

    await clearLoginFailures({ ip, email, fingerprint })

    const cookieData = await createSessionCookies({
      idToken: signInResult.idToken,
      uid: user.id,
      role: user.role as "ADMIN" | "STUDENT" | "TRAINER" | "RECRUITER",
      mustChangePassword: user.mustChangePassword,
      rememberMe,
    })

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
        name: user.studentProfile?.name,
        photoUrl: user.studentProfile?.photoUrl,
      },
      redirectUrl: user.mustChangePassword
        ? "/change-password"
        : getDashboardPath(user.role as "ADMIN" | "STUDENT" | "TRAINER" | "RECRUITER"),
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

    return response
  } catch {
    const failure = await recordLoginFailure({ ip, email, fingerprint })
    await logAuthEvent({
      action: "LOGIN_FAILED",
      ip,
      email,
      userAgent,
      fingerprint,
      metadata: {
        reason: "firebase_sign_in_failed",
        failCount: failure.emailFailureCount,
        ipFailCount: failure.ipFailureCount,
      },
    })
    await applyProgressiveDelay(failure.emailFailureCount)

    return NextResponse.json(
      {
        error: "Invalid email or password.",
        code: "AUTH_FAILED",
        captchaRequired: failure.captchaRequired,
      },
      { status: 401 }
    )
  }
}
