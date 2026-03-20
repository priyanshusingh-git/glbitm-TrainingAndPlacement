import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { logAuthEvent } from "@/lib/auth-audit"
import {
  applyRateLimitHeaders,
  otpRequestLimiter,
  passwordResetLimiter,
} from "@/lib/auth-rate-limit"
import { validateCsrfToken } from "@/lib/csrf"
import { logger } from "@/lib/logger"
import { generateOtp, hashOtp } from "@/lib/otp"
import { getIpAddress, getUserAgent } from "@/lib/request-context"
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
      return NextResponse.json(
        { error: "Security validation failed.", code: "CSRF_INVALID" },
        { status: 403 }
      )
    }

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
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
      const response = NextResponse.json({ message: GENERIC_MESSAGE }, { status: 200 })
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

    const genericResponse = NextResponse.json({ message: GENERIC_MESSAGE })

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    })

    if (!user) {
      await new Promise((resolve) => setTimeout(resolve, 250))
      return genericResponse
    }

    const otp = generateOtp()
    await redis.set(
      `otp:${user.email}`,
      {
        hash: hashOtp(otp),
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
    logger.error("Request Password Reset Error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
