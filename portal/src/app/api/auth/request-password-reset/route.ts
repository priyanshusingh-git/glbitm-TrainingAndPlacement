import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { logAuthEvent } from "@/lib/auth-audit"
import {
  applyRateLimitHeaders,
  clearOtpResendCount,
  otpRequestLimiter,
  passwordResetLimiter,
  recordOtpResend,
  trackPasswordResetAbuse,
} from "@/lib/auth-rate-limit"
// Firebase removed — suspension handled via Prisma only
import { validateCsrfToken } from "@/lib/csrf"
import { logger } from "@/lib/logger"
import { generateOtp, generateOtpSalt, hashOtp } from "@/lib/otp"
import { attachRequestContextHeaders } from "@/lib/request-context"
import { getIpAddress, getUserAgent } from "@/lib/request-context"
import { createProblemResponse, handleApiError } from "@/lib/problem-details"
import { redis } from "@/lib/redis"
import { sendPasswordResetEmail } from "@/services/email.service"

const GENERIC_MESSAGE =
  "If an account exists with this email, a verification code has been sent."

export async function POST(req: NextRequest) {
  const ip = getIpAddress(req)
  const userAgent = getUserAgent(req)

  try {
    const body = await req.json().catch(() => null)
    const email = body?.email?.trim?.().toLowerCase?.()
    const csrfToken = body?.csrfToken ?? req.headers.get("x-csrf-token")

    if (!(await validateCsrfToken(req, csrfToken))) {
      return createProblemResponse(req, {
        status: 403,
        code: "CSRF_INVALID",
        title: "Security validation failed",
        detail: "Security validation failed.",
      })
    }

    if (!email || typeof email !== "string") {
      return createProblemResponse(req, {
        status: 400,
        code: "VALIDATION_ERROR",
        title: "Invalid request",
        detail: "Email is required.",
      })
    }

    const [otpLimit, resetLimit] = await Promise.all([
      otpRequestLimiter.limit(ip),
      passwordResetLimiter.limit(ip),
    ])

    if (!otpLimit.success || !resetLimit.success) {
      const rateLimitResult = !otpLimit.success ? otpLimit : resetLimit
      const retryAfter = Math.max(
        1,
        Math.ceil((Number(rateLimitResult.reset ?? Date.now()) - Date.now()) / 1000)
      )
      const response = attachRequestContextHeaders(
        req,
        NextResponse.json({ message: GENERIC_MESSAGE }, { status: 200 })
      )
      applyRateLimitHeaders(response, rateLimitResult, retryAfter)
      await logAuthEvent({
        action: "RATE_LIMITED",
        ip,
        email,
        userAgent,
        metadata: {
          endpoint: "/api/auth/request-password-reset",
          limitType: !otpLimit.success ? "otp" : "password_reset",
          retryAfter,
        },
      })
      return response
    }

    const genericResponse = attachRequestContextHeaders(
      req,
      NextResponse.json({ message: GENERIC_MESSAGE })
    )

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        isSuspended: true,
      },
    })

    if (!user) {
      await new Promise((resolve) => setTimeout(resolve, 250))
      return genericResponse
    }

    if (user.isSuspended) {
      await new Promise((resolve) => setTimeout(resolve, 250))
      return genericResponse
    }

    const resetAbuseCount = await trackPasswordResetAbuse(user.email)
    if (resetAbuseCount > 3) {
      // Suspend abusive account directly in DB (Firebase removed)
      await prisma.user.update({
        where: { id: user.id },
        data: {
          isSuspended: true,
          suspendedReason:
            "Your account has been suspended. Contact the T&P office.",
          suspendedAt: new Date(),
        },
      })
      await logAuthEvent({
        action: "ACCOUNT_SUSPENDED",
        ip,
        userId: user.id,
        email: user.email,
        userAgent,
        metadata: {
          reason: "password_reset_abuse",
          resetRequestCount24h: resetAbuseCount,
        },
      })
      await logAuthEvent({
        action: "SESSION_REVOKED",
        ip,
        userId: user.id,
        email: user.email,
        userAgent,
        metadata: {
          reason: "account_suspended_password_reset_abuse",
        },
      })
      await new Promise((resolve) => setTimeout(resolve, 250))
      return genericResponse
    }

    const existingOtp = await redis.get(`otp:${user.email}`)
    if (existingOtp) {
      const resendCount = await recordOtpResend(ip, user.email)
      if (resendCount > 3) {
        return genericResponse
      }
    } else {
      await clearOtpResendCount(ip, user.email)
    }

    const otp = generateOtp()
    const salt = generateOtpSalt()
    await redis.set(
      `otp:${user.email}`,
      {
        hash: hashOtp(otp, salt),
        salt,
        attempts: 0,
        uid: user.id,
        email: user.email,
        createdAt: Date.now(),
      },
      {
        ex: 10 * 60,
      }
    )

    void sendPasswordResetEmail(user.email, user.name || "User", otp).catch((error) =>
      logger.error("Failed to send password reset OTP email:", error)
    )

    await logAuthEvent({
      action: "OTP_SENT",
      ip,
      userId: user.id,
      email: user.email,
      userAgent,
    })

    return genericResponse
  } catch (error) {
    return handleApiError(req, error, {
      event: "auth.password_reset_request.failed",
      message: "Password reset request failed",
      context: {
        ip,
        userAgent,
      },
    })
  }
}
