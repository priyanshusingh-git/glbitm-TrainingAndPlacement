import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { parseRoleClaim } from "@/lib/auth-claims"
import { logger } from "@/lib/logger"
import { createProblemResponse } from "@/lib/problem-details"
import { getIpAddress, getRequestId, getUserAgent } from "@/lib/request-context"
import { SESSION_COOKIE_NAME } from "@/lib/role-cookie"
import { verifyServerSession } from "@/lib/session"

export type AuthUser = {
 id: string
 email: string
 role: string
 mustChangePassword: boolean
 sessionVersion: number
}

export async function authenticate(req: NextRequest): Promise<AuthUser | NextResponse> {
  const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value

  if (!sessionCookie) {
    return createProblemResponse(req, {
      status: 401,
      code: "UNAUTHORIZED",
      title: "Authentication failed",
      detail: "You need to sign in to access this resource.",
    })
  }

  try {
    const decodedToken = await verifyServerSession(sessionCookie)
    const userId = decodedToken.uid
    const role = parseRoleClaim(decodedToken.role)

    if (!role) {
      logger.warn("Rejected session with missing role claim", {
        event: "auth.session.invalid_claims",
        requestId: getRequestId(req),
        path: req.nextUrl.pathname,
        method: req.method,
        ip: getIpAddress(req),
        userAgent: getUserAgent(req),
        uid: userId,
      })
      return createProblemResponse(req, {
        status: 401,
        code: "INVALID_SESSION",
        title: "Authentication failed",
        detail: "Your session is invalid or has expired.",
      })
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, mustChangePassword: true, sessionVersion: true, isSuspended: true, suspendedReason: true },
    })

    if (!dbUser) {
      logger.warn("Rejected session for missing database user", {
        event: "auth.session.user_missing",
        requestId: getRequestId(req),
        path: req.nextUrl.pathname,
        method: req.method,
        ip: getIpAddress(req),
        userAgent: getUserAgent(req),
        uid: userId,
      })
      return createProblemResponse(req, {
        status: 401,
        code: "INVALID_SESSION",
        title: "Authentication failed",
        detail: "Your session is invalid or has expired.",
      })
    }

    if (dbUser.isSuspended) {
      return createProblemResponse(req, {
        status: 403,
        code: "ACCOUNT_SUSPENDED",
        title: "Access denied",
        detail:
          dbUser.suspendedReason || "Your account has been suspended. Contact the T&P office.",
      })
    }

    if (decodedToken.sessionVersion !== dbUser.sessionVersion) {
      return createProblemResponse(req, {
        status: 401,
        code: "INVALID_SESSION",
        title: "Authentication failed",
        detail: "Your session is invalid or has expired.",
      })
    }

    return {
      id: dbUser.id,
      email: decodedToken.email || dbUser.email,
      role: dbUser.role,
      mustChangePassword: dbUser.mustChangePassword,
      sessionVersion: dbUser.sessionVersion,
    }
  } catch (error) {
    logger.warn("Rejected invalid or expired session", {
      event: "auth.session.invalid",
      requestId: getRequestId(req),
      path: req.nextUrl.pathname,
      method: req.method,
      ip: getIpAddress(req),
      userAgent: getUserAgent(req),
      error,
    })
    return createProblemResponse(req, {
      status: 401,
      code: "INVALID_SESSION",
      title: "Authentication failed",
      detail: "Your session is invalid or has expired.",
    })
  }
}

export async function authorize(req: NextRequest, roles: string[]): Promise<AuthUser | NextResponse> {
 const authResult = await authenticate(req)

 if (authResult instanceof NextResponse) {
 return authResult
 }

 if (!roles.includes(authResult.role)) {
 return createProblemResponse(req, {
  status: 403,
  code: "FORBIDDEN",
  title: "Access denied",
  detail: "You do not have permission to access this resource.",
 })
 }

 return authResult
}
