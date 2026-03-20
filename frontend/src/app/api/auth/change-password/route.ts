import { NextRequest, NextResponse } from "next/server"
import { authenticate } from "@/lib/auth-middleware"
import { logAuthEvent } from "@/lib/auth-audit"
import { validateCsrfToken } from "@/lib/csrf"
import prisma from "@/lib/db"
import { logger } from "@/lib/logger"
import { isPwnedPassword } from "@/lib/pwned"
import { getIpAddress, getUserAgent } from "@/lib/request-context"
import { getCookieTtlSeconds, ROLE_COOKIE_NAME, signRoleCookie, verifyRoleCookie } from "@/lib/role-cookie"
import { validateStrongPassword } from "@/lib/validators"

export async function POST(req: NextRequest) {
  const authResult = await authenticate(req)
  if (authResult instanceof NextResponse) return authResult

  const ip = getIpAddress(req)
  const userAgent = getUserAgent(req)

  try {
    const body = await req.json().catch(() => null)
    const newPassword = body?.newPassword
    const csrfToken = body?.csrfToken ?? req.headers.get("x-csrf-token")

    if (!(await validateCsrfToken(req, csrfToken))) {
      return NextResponse.json(
        { error: "Security validation failed.", code: "CSRF_INVALID" },
        { status: 403 }
      )
    }

    if (!newPassword || typeof newPassword !== "string") {
      return NextResponse.json(
        { error: "A valid new password is required" },
        { status: 400 }
      )
    }

    const passwordError = validateStrongPassword(newPassword)
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 })
    }

    if (newPassword.trim().toLowerCase() === authResult.email.toLowerCase()) {
      return NextResponse.json(
        { error: "Password cannot be the same as your email address." },
        { status: 400 }
      )
    }

    try {
      if (await isPwnedPassword(newPassword)) {
        return NextResponse.json(
          { error: "This password has appeared in known data breaches. Choose a different password." },
          { status: 400 }
        )
      }
    } catch (error) {
      logger.warn("HIBP validation unavailable during password change:", error)
      return NextResponse.json(
        { error: "Password validation is temporarily unavailable. Try again shortly." },
        { status: 503 }
      )
    }

    const { authAdmin } = await import("@/lib/firebase-admin")
    try {
      await authAdmin.updateUser(authResult.id, {
        password: newPassword,
      })
      await authAdmin.revokeRefreshTokens(authResult.id)
    } catch (authError) {
      logger.error("Firebase change password error:", authError)
      return NextResponse.json(
        { error: "Failed to update password in Auth" },
        { status: 500 }
      )
    }

    await prisma.user.update({
      where: { id: authResult.id },
      data: { mustChangePassword: false },
    })

    const response = NextResponse.json({ message: "Password changed successfully" })
    const currentRoleCookie = req.cookies.get(ROLE_COOKIE_NAME)?.value

    if (currentRoleCookie) {
      try {
        const currentRole = await verifyRoleCookie(currentRoleCookie)
        const refreshedRoleCookie = await signRoleCookie(
          {
            uid: authResult.id,
            role: authResult.role as "ADMIN" | "STUDENT" | "TRAINER" | "RECRUITER",
            mustChangePassword: false,
            rememberMe: currentRole.rememberMe,
          },
          currentRole.rememberMe
        )

        response.cookies.set(ROLE_COOKIE_NAME, refreshedRoleCookie, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
          ...(currentRole.rememberMe ? { maxAge: getCookieTtlSeconds(true) } : {}),
        })
      } catch {
        // If the role cookie cannot be refreshed, the next login will rebuild it.
      }
    }

    await Promise.all([
      logAuthEvent({
        action: "PASSWORD_RESET_SUCCESS",
        ip,
        userId: authResult.id,
        email: authResult.email,
        userAgent,
        metadata: {
          source: "change_password",
        },
      }),
      logAuthEvent({
        action: "SESSION_REVOKED",
        ip,
        userId: authResult.id,
        email: authResult.email,
        userAgent,
        metadata: {
          reason: "password_change",
        },
      }),
    ])

    return response
  } catch (error) {
    logger.error("Change Password Error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
