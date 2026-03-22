import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { fromFirebaseRoleClaim } from "@/lib/auth-claims"
import { applyRateLimitHeaders, generalApiLimiter } from "@/lib/auth-rate-limit"
import { getDashboardPath, SESSION_COOKIE_NAME } from "@/lib/role-cookie"
import { clearSessionCookies, verifyServerSession } from "@/lib/session"

function getIpAddress(request: NextRequest) {
  return (request.headers.get("x-forwarded-for") ?? "127.0.0.1")
    .split(",")[0]
    .trim()
}

function applySecurityHeaders(response: NextResponse) {
  response.headers.set("X-Frame-Options", "SAMEORIGIN")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
  response.headers.set("X-DNS-Prefetch-Control", "on")

  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    )
  }

  return response
}

function buildContentSecurityPolicy() {
  return [
    "default-src 'self'",
    // Next.js prerendered pages emit inline hydration scripts without a nonce.
    // Requiring one here blocks the entire client bundle in production.
    "script-src 'self' 'unsafe-inline' https://hcaptcha.com https://*.hcaptcha.com https://va.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https://res.cloudinary.com https://lh3.googleusercontent.com",
    "connect-src 'self' https://*.firebase.com https://*.googleapis.com https://*.upstash.io https://api.pwnedpasswords.com https://hcaptcha.com https://*.hcaptcha.com https://vitals.vercel-insights.com",
    "frame-src 'self' https://hcaptcha.com https://*.hcaptcha.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ")
}

function applyContentSecurityPolicy(
  response: NextResponse
) {
  response.headers.set("Content-Security-Policy", buildContentSecurityPolicy())
  return response
}

function finalizeResponse(response: NextResponse, requestId: string) {
  applySecurityHeaders(response)
  applyContentSecurityPolicy(response)
  response.headers.set("x-request-id", requestId)
  return response
}

export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone()
  const path = url.pathname
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID()

  try {
    if (path.startsWith("/api") && !path.startsWith("/api/auth/") && path !== "/api/auth/csrf") {
      const result = await generalApiLimiter.limit(getIpAddress(request))
      if (!result.success) {
        const retryAfter = Math.max(
          1,
          Math.ceil((Number(result.reset ?? Date.now()) - Date.now()) / 1000)
        )
        const response = NextResponse.json(
          { error: "Too Many Requests", retryAfter },
          { status: 429 }
        )
        applyRateLimitHeaders(response, result, retryAfter)
        return finalizeResponse(response, requestId)
      }
    }
  } catch (error) {
    // Rate limiter unavailable — allow request through, log for monitoring
    console.error("[middleware] Rate limiter unavailable:", error)
    // Do NOT return 429 — fall through to continue processing
  }

  const protectedRoutes = [
    { prefix: "/student", role: "STUDENT" },
    { prefix: "/admin", role: "ADMIN" },
    { prefix: "/trainer", role: "TRAINER" },
    { prefix: "/recruiter", role: "RECRUITER" },
  ] as const
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value

  let session: {
    uid: string
    role: "ADMIN" | "STUDENT" | "TRAINER" | "RECRUITER"
    mustChangePassword: boolean
  } | null = null

  if (sessionCookie) {
    try {
      const decoded = await verifyServerSession(sessionCookie)
      const role = fromFirebaseRoleClaim(decoded.role)

      if (!role) {
        throw new Error("Missing role claim")
      }

      session = {
        uid: decoded.uid,
        role,
        mustChangePassword: Boolean(decoded.mustChangePassword),
      }
    } catch {
      if (!path.startsWith("/api") && path !== "/login") {
        const redirectUrl = new URL("/login", request.url)
        if (
          path.startsWith("/student") ||
          path.startsWith("/admin") ||
          path.startsWith("/trainer") ||
          path.startsWith("/recruiter")
        ) {
          redirectUrl.searchParams.set("redirect", path)
        }

        const redirectResponse = NextResponse.redirect(redirectUrl)
        clearSessionCookies(redirectResponse)
        return finalizeResponse(redirectResponse, requestId)
      }

      const response = path.startsWith("/api")
        ? NextResponse.next()
        : NextResponse.redirect(new URL("/login", request.url))
      clearSessionCookies(response)
      return finalizeResponse(response, requestId)
    }
  }

  if (session && (path === "/" || path === "/login")) {
    url.pathname = session.mustChangePassword ? "/change-password" : getDashboardPath(session.role)
    return finalizeResponse(NextResponse.redirect(url), requestId)
  }

  if (path === "/change-password") {
    if (!session) {
      url.pathname = "/login"
      return finalizeResponse(NextResponse.redirect(url), requestId)
    }

    if (!session.mustChangePassword) {
      url.pathname = getDashboardPath(session.role)
      return finalizeResponse(NextResponse.redirect(url), requestId)
    }
  }

  const matchedProtectedRoute = protectedRoutes.find((route) => path === route.prefix || path.startsWith(`${route.prefix}/`))
  if (matchedProtectedRoute) {
    if (!session) {
      url.pathname = "/login"
      url.searchParams.set("redirect", path)
      return finalizeResponse(NextResponse.redirect(url), requestId)
    }

    if (session.mustChangePassword && path !== "/change-password") {
      url.pathname = "/change-password"
      return finalizeResponse(NextResponse.redirect(url), requestId)
    }

    if (session.role !== matchedProtectedRoute.role) {
      url.pathname = getDashboardPath(session.role)
      return finalizeResponse(NextResponse.redirect(url), requestId)
    }
  }

  if (path.startsWith("/admin/login") || path.startsWith("/student/login")) {
    url.pathname = "/login"
    return finalizeResponse(NextResponse.redirect(url), requestId)
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-request-id", requestId)

  return finalizeResponse(
    NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    }),
    requestId
  )
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
