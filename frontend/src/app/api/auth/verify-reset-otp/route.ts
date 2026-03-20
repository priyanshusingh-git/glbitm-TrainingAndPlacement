import { NextRequest, NextResponse } from "next/server"
import { logAuthEvent } from "@/lib/auth-audit"
import { validateCsrfToken } from "@/lib/csrf"
import { createPasswordResetToken, hashOtp } from "@/lib/otp"
import { getIpAddress, getUserAgent } from "@/lib/request-context"
import { redis } from "@/lib/redis"

export async function POST(req: NextRequest) {
  const ip = getIpAddress(req)
  const userAgent = getUserAgent(req)

  const body = await req.json().catch(() => null)
  const email = body?.email?.trim?.().toLowerCase?.()
  const otp = body?.otp?.trim?.()
  const csrfToken = body?.csrfToken ?? req.headers.get("x-csrf-token")

  if (!(await validateCsrfToken(req, csrfToken))) {
    return NextResponse.json(
      { error: "Security validation failed.", code: "CSRF_INVALID" },
      { status: 403 }
    )
  }

  if (!email || typeof email !== "string" || !otp || typeof otp !== "string") {
    return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 })
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
    return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 })
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
    return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 })
  }

  if (record.hash !== hashOtp(otp)) {
    const nextAttempts = Number(record.attempts) + 1
    const elapsedSeconds = Math.floor((Date.now() - Number(record.createdAt)) / 1000)
    const remainingTtl = Math.max(1, 10 * 60 - elapsedSeconds)

    await redis.set(
      `otp:${email}`,
      { ...record, attempts: nextAttempts },
      { ex: remainingTtl }
    )

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
    return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 })
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

  return NextResponse.json({ message: "Verification successful", resetToken })
}
