import { NextRequest, NextResponse } from "next/server"
import { logAuthEvent } from "@/lib/auth-audit"
import { validateCsrfToken } from "@/lib/csrf"
import { authAdmin } from "@/lib/firebase-admin"
import { getIpAddress, getUserAgent } from "@/lib/request-context"
import { SESSION_COOKIE_NAME } from "@/lib/role-cookie"
import { clearSessionCookies, verifyServerSession } from "@/lib/session"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const csrfToken = body?.csrfToken ?? req.headers.get("x-csrf-token")

  if (!(await validateCsrfToken(req, csrfToken))) {
    return NextResponse.json(
      { error: "Security validation failed.", code: "CSRF_INVALID" },
      { status: 403 }
    )
  }

  const ip = getIpAddress(req)
  const userAgent = getUserAgent(req)
  const response = NextResponse.json({ success: true })
  const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value

  if (sessionCookie) {
    try {
      const decoded = await verifyServerSession(sessionCookie)
      await authAdmin.revokeRefreshTokens(decoded.uid)
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
}
