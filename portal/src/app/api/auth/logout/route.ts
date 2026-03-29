import { NextRequest, NextResponse } from "next/server"
import { logAuthEvent } from "@/lib/auth-audit"
import { validateCsrfToken } from "@/lib/csrf"
// Removed Firebase import
import { attachRequestContextHeaders, getIpAddress, getUserAgent } from "@/lib/request-context"
import { createProblemResponse, handleApiError } from "@/lib/problem-details"
import { SESSION_COOKIE_NAME } from "@/lib/role-cookie"
import { clearSessionCookies, verifyServerSession } from "@/lib/session"

export async function POST(req: NextRequest) {
  const ip = getIpAddress(req)
  const userAgent = getUserAgent(req)

  try {
    const body = await req.json().catch(() => null)
    const csrfToken = body?.csrfToken ?? req.headers.get("x-csrf-token")

    if (!(await validateCsrfToken(req, csrfToken))) {
      return createProblemResponse(req, {
        status: 403,
        code: "CSRF_INVALID",
        title: "Security validation failed",
        detail: "Security validation failed.",
      })
    }

    const response = attachRequestContextHeaders(req, NextResponse.json({ success: true }))
    const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value

    if (sessionCookie) {
      try {
        const decoded = await verifyServerSession(sessionCookie)
        // JWT is stateless; simply dropping the cookie acts as logout.
        await logAuthEvent({
          action: "SESSION_REVOKED",
          ip,
          userId: decoded.uid,
          userAgent,
          metadata: {
            reason: "logout",
          },
        })
      } catch {
        // Ignore invalid sessions on logout.
      }
    }

    clearSessionCookies(response)
    return response
  } catch (error) {
    return handleApiError(req, error, {
      event: "auth.logout.failed",
      message: "Logout failed",
      context: {
        ip,
        userAgent,
      },
    })
  }
}
