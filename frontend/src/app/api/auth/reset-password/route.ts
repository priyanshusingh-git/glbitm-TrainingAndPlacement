import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { logAuthEvent } from "@/lib/auth-audit"
import { syncUserAuthClaims } from "@/lib/auth-claims"
import { validateCsrfToken } from "@/lib/csrf"
import { authAdmin } from "@/lib/firebase-admin"
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
    const resetToken = body?.resetToken
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
      logger.warn("HIBP validation unavailable during password reset:", error)
      return createProblemResponse(req, {
        status: 503,
        code: "PASSWORD_VALIDATION_UNAVAILABLE",
        title: "Service temporarily unavailable",
        detail: "Password validation is temporarily unavailable. Try again shortly.",
      })
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
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
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
    await syncUserAuthClaims({
      uid: user.id,
      role: user.role as "ADMIN" | "STUDENT" | "TRAINER" | "RECRUITER",
      mustChangePassword: false,
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

    return attachRequestContextHeaders(
      req,
      NextResponse.json({ message: "Password reset successfully" })
    )
  } catch (error) {
    return handleApiError(req, error, {
      event: "auth.password_reset.failed",
      message: "Password reset failed",
      context: {
        ip,
        userAgent,
      },
    })
  }
}
