import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import bcrypt from "bcryptjs"
import { logAuthEvent } from "@/lib/auth-audit"
import { validateCsrfToken } from "@/lib/csrf"
import { logger } from "@/lib/logger"
import { verifyPasswordResetToken } from "@/lib/otp"
import { isPwnedPassword } from "@/lib/pwned"
import { attachRequestContextHeaders } from "@/lib/request-context"
import { getIpAddress, getUserAgent } from "@/lib/request-context"
import { createProblemResponse, handleApiError } from "@/lib/problem-details"
import { validateStrongPassword } from "@/lib/validators"
import { sendPasswordChangedEmail } from "@/services/email.service"

export async function POST(req: NextRequest) {
  const ip = getIpAddress(req)
  const userAgent = getUserAgent(req)

  try {
    const body = await req.json().catch(() => null)
    const resetToken = req.cookies.get("__reset_token")?.value
    const newPassword = body?.newPassword
    const csrfToken = body?.csrfToken ?? req.headers.get("x-csrf-token")

    if (!(await validateCsrfToken(req, csrfToken))) {
      return createProblemResponse(req, {
        status: 403,
        code: "CSRF_INVALID",
        title: "Security validation failed",
        detail: "Security validation failed.",
      })
    }

    if (!resetToken || typeof resetToken !== "string" || typeof newPassword !== "string") {
      return createProblemResponse(req, {
        status: 400,
        code: "VALIDATION_ERROR",
        title: "Invalid request",
        detail: "Reset token and new password are required.",
      })
    }

    const passwordError = validateStrongPassword(newPassword)
    if (passwordError) {
      return createProblemResponse(req, {
        status: 400,
        code: "PASSWORD_WEAK",
        title: "Invalid request",
        detail: passwordError,
      })
    }

    try {
      if (await isPwnedPassword(newPassword)) {
        return createProblemResponse(req, {
          status: 400,
          code: "PASSWORD_PWNED",
          title: "Invalid request",
          detail: "This password has appeared in known data breaches. Choose a different password.",
        })
      }
    } catch (error) {
      logger.warn("HIBP check unavailable, proceeding without breach check:", error)
    }

    const tokenPayload = await verifyPasswordResetToken(resetToken).catch(() => null)
    if (!tokenPayload) {
      return createProblemResponse(req, {
        status: 400,
        code: "RESET_TOKEN_INVALID",
        title: "Invalid request",
        detail: "Invalid or expired reset token.",
      })
    }

    const user = await prisma.user.findUnique({
      where: { id: tokenPayload.uid },
      select: { id: true, email: true, name: true, role: true },
    })

    if (!user || user.email !== tokenPayload.email) {
      return createProblemResponse(req, {
        status: 400,
        code: "RESET_TOKEN_INVALID",
        title: "Invalid request",
        detail: "Invalid or expired reset token.",
      })
    }

    if (newPassword.trim().toLowerCase() === user.email.toLowerCase()) {
      return createProblemResponse(req, {
        status: 400,
        code: "PASSWORD_EMAIL_MATCH",
        title: "Invalid request",
        detail: "Password cannot be the same as your email address.",
      })
    }

    // Native bcrypt hash (replaces authAdmin.updateUser)
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
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
        metadata: { reason: "password_reset" },
      }),
    ])

    const response = attachRequestContextHeaders(
      req,
      NextResponse.json({ message: "Password reset successfully" })
    )
    response.cookies.set("__reset_token", "", { maxAge: 0, path: "/api/auth/reset-password" })
    return response
  } catch (error) {
    return handleApiError(req, error, {
      event: "auth.password_reset.failed",
      message: "Password reset failed",
      context: { ip, userAgent },
    })
  }
}
