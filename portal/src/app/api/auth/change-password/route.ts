import { NextRequest, NextResponse } from "next/server"
import { authenticate } from "@/lib/auth-middleware"
import { logAuthEvent } from "@/lib/auth-audit"
import { validateCsrfToken } from "@/lib/csrf"
import prisma from "@/lib/db"
import bcrypt from "bcryptjs"
import { logger } from "@/lib/logger"
import { isPwnedPassword } from "@/lib/pwned"
import { attachRequestContextHeaders, getIpAddress, getUserAgent } from "@/lib/request-context"
import { createProblemResponse, handleApiError } from "@/lib/problem-details"
import { getCookieTtlSeconds, ROLE_COOKIE_NAME, signRoleCookie, verifyRoleCookie } from "@/lib/role-cookie"
import { clearSessionCookies, createSessionCookies, applySessionCookies } from "@/lib/session"
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
      return createProblemResponse(req, {
        status: 403,
        code: "CSRF_INVALID",
        title: "Security validation failed",
        detail: "Security validation failed.",
      })
    }

    if (!newPassword || typeof newPassword !== "string") {
      return createProblemResponse(req, {
        status: 400,
        code: "VALIDATION_ERROR",
        title: "Invalid request",
        detail: "A valid new password is required.",
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

    if (newPassword.trim().toLowerCase() === authResult.email.toLowerCase()) {
      return createProblemResponse(req, {
        status: 400,
        code: "PASSWORD_EMAIL_MATCH",
        title: "Invalid request",
        detail: "Password cannot be the same as your email address.",
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

    // Hash new password natively with bcrypt
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    await prisma.user.update({
      where: { id: authResult.id },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
      },
    })

    // Issue a fresh session cookie so the user stays logged in
    const cookieData = await createSessionCookies({
      uid: authResult.id,
      email: authResult.email,
      role: authResult.role as "ADMIN" | "STUDENT" | "TRAINER" | "RECRUITER",
      mustChangePassword: false,
      rememberMe: false,
    })

    const response = NextResponse.json({ message: "Password changed successfully" })

    // Apply fresh session
    applySessionCookies(response, { ...cookieData, rememberMe: false })

    // Also refresh role cookie
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
        metadata: { source: "change_password" },
      }),
      logAuthEvent({
        action: "SESSION_REVOKED",
        ip,
        userId: authResult.id,
        email: authResult.email,
        userAgent,
        metadata: { reason: "password_change" },
      }),
    ])

    return attachRequestContextHeaders(req, response)
  } catch (error) {
    return handleApiError(req, error, {
      event: "auth.password_change.failed",
      message: "Password change failed",
      context: { userId: authResult.id, ip, userAgent },
    })
  }
}
