import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { logAuthEvent } from "@/lib/auth-audit"
import { validateCsrfToken } from "@/lib/csrf"
import { authAdmin } from "@/lib/firebase-admin"
import { logger } from "@/lib/logger"
import { verifyPasswordResetToken } from "@/lib/otp"
import { isPwnedPassword } from "@/lib/pwned"
import { getIpAddress, getUserAgent } from "@/lib/request-context"
import { validateStrongPassword } from "@/lib/validators"
import { sendPasswordChangedEmail } from "@/services/email.service"

export async function POST(req: NextRequest) {
  const ip = getIpAddress(req)
  const userAgent = getUserAgent(req)

  try {
    const body = await req.json().catch(() => null)
    const resetToken = body?.resetToken
    const newPassword = body?.newPassword
    const csrfToken = body?.csrfToken ?? req.headers.get("x-csrf-token")

    if (!(await validateCsrfToken(req, csrfToken))) {
      return NextResponse.json(
        { error: "Security validation failed.", code: "CSRF_INVALID" },
        { status: 403 }
      )
    }

    if (!resetToken || typeof resetToken !== "string" || typeof newPassword !== "string") {
      return NextResponse.json(
        { error: "Reset token and new password are required" },
        { status: 400 }
      )
    }

    const passwordError = validateStrongPassword(newPassword)
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 })
    }

    try {
      if (await isPwnedPassword(newPassword)) {
        return NextResponse.json(
          { error: "This password has appeared in known data breaches. Choose a different password." },
          { status: 400 }
        )
      }
    } catch (error) {
      logger.warn("HIBP validation unavailable during password reset:", error)
      return NextResponse.json(
        { error: "Password validation is temporarily unavailable. Try again shortly." },
        { status: 503 }
      )
    }

    const tokenPayload = await verifyPasswordResetToken(resetToken).catch(() => null)
    if (!tokenPayload) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: tokenPayload.uid },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    if (!user || user.email !== tokenPayload.email) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 })
    }

    if (newPassword.trim().toLowerCase() === user.email.toLowerCase()) {
      return NextResponse.json(
        { error: "Password cannot be the same as your email address." },
        { status: 400 }
      )
    }

    await authAdmin.updateUser(user.id, {
      password: newPassword,
    })
    await authAdmin.revokeRefreshTokens(user.id)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        mustChangePassword: false,
      },
    })

    void sendPasswordChangedEmail(user.email, user.name || "User").catch((error) =>
      logger.error("Failed to send password changed email:", error)
    )

    await Promise.all([
      logAuthEvent({
        action: "PASSWORD_RESET_SUCCESS",
        ip,
        userId: user.id,
        email: user.email,
        userAgent,
      }),
      logAuthEvent({
        action: "SESSION_REVOKED",
        ip,
        userId: user.id,
        email: user.email,
        userAgent,
        metadata: {
          reason: "password_reset",
        },
      }),
    ])

    return NextResponse.json({ message: "Password reset successfully" })
  } catch (error) {
    logger.error("Reset Password Error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
