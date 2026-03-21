import { NextRequest, NextResponse } from "next/server"
import { logAuthEvent } from "@/lib/auth-audit"
import { validateCsrfToken } from "@/lib/csrf"
import { createPasswordResetToken, hashOtp } from "@/lib/otp"
import { attachRequestContextHeaders, getIpAddress, getUserAgent } from "@/lib/request-context"
import { createProblemResponse } from "@/lib/problem-details"
import { redis } from "@/lib/redis"

export async function POST(req: NextRequest) {
  const ip = getIpAddress(req)
  const userAgent = getUserAgent(req)

  const body = await req.json().catch(() => null)
  const email = body?.email?.trim?.().toLowerCase?.()
  const otp = body?.otp?.trim?.()
  const csrfToken = body?.csrfToken ?? req.headers.get("x-csrf-token")

  if (!(await validateCsrfToken(req, csrfToken))) {
    return createProblemResponse(req, {
      status: 403,
      code: "CSRF_INVALID",
      title: "Security validation failed",
      detail: "Security validation failed.",
    })
  }

  if (!email || typeof email !== "string" || !otp || typeof otp !== "string") {
    return createProblemResponse(req, {
      status: 400,
      code: "VALIDATION_ERROR",
      title: "Invalid request",
      detail: "Email and verification code are required.",
    })
  }

  const record = await redis.get<{
    hash: string
    attempts: number
    uid: string
    email: string
    createdAt: number
  }>(`otp:${email}`)

  if (!record) {
    await logAuthEvent({
      action: "OTP_EXPIRED",
      ip,
      email,
      userAgent,
    })
    return createProblemResponse(req, {
      status: 400,
      code: "OTP_INVALID",
      title: "Invalid request",
      detail: "Invalid or expired verification code.",
    })
  }

  if (Number(record.attempts) >= 3) {
    await redis.del(`otp:${email}`)
    await logAuthEvent({
      action: "OTP_FAILED",
      ip,
      userId: record.uid,
      email,
      userAgent,
      metadata: {
        attemptCount: Number(record.attempts),
        reason: "too_many_attempts",
      },
    })
    return createProblemResponse(req, {
      status: 400,
      code: "OTP_INVALID",
      title: "Invalid request",
      detail: "Invalid or expired verification code.",
    })
  }

  if (record.hash !== hashOtp(otp)) {
    const nextAttempts = Number(record.attempts) + 1
    if (nextAttempts >= 3) {
      await redis.del(`otp:${email}`)
    } else {
      const elapsedSeconds = Math.floor((Date.now() - Number(record.createdAt)) / 1000)
      const remainingTtl = Math.max(1, 10 * 60 - elapsedSeconds)

      await redis.set(
        `otp:${email}`,
        { ...record, attempts: nextAttempts },
        { ex: remainingTtl }
      )
    }

    await logAuthEvent({
      action: "OTP_FAILED",
      ip,
      userId: record.uid,
      email,
      userAgent,
      metadata: {
        attemptCount: nextAttempts,
      },
    })
    return createProblemResponse(req, {
      status: 400,
      code: "OTP_INVALID",
      title: "Invalid request",
      detail: "Invalid or expired verification code.",
    })
  }

  await redis.del(`otp:${email}`)
  const resetToken = await createPasswordResetToken({
    uid: record.uid,
    email: record.email,
  })

  await logAuthEvent({
    action: "OTP_VERIFIED",
    ip,
    userId: record.uid,
    email: record.email,
    userAgent,
  })

  return attachRequestContextHeaders(
    req,
    NextResponse.json({ message: "Verification successful", resetToken })
  )
}
