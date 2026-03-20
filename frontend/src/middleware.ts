import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { applyRateLimitHeaders, generalApiLimiter } from '@/lib/auth-rate-limit'
import { getIpAddress } from '@/lib/request-context'
import { getDashboardPath, ROLE_COOKIE_NAME, SESSION_COOKIE_NAME, verifyRoleCookie } from '@/lib/role-cookie'

function applySecurityHeaders(response: NextResponse) {
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set('X-DNS-Prefetch-Control', 'on')

  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    )
  }

  return response
}

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const path = url.pathname
  const ip = getIpAddress(request)

  try {
    if (path.startsWith('/api') && !path.startsWith('/api/auth/') && path !== '/api/auth/csrf') {
      const result = await generalApiLimiter.limit(ip)
      if (!result.success) {
        const retryAfter = Math.max(
          1,
          Math.ceil((Number(result.reset ?? Date.now()) - Date.now()) / 1000)
        )
        const response = NextResponse.json(
          { error: 'Too Many Requests', retryAfter },
          { status: 429 }
        )
        applyRateLimitHeaders(response, result, retryAfter)
        return applySecurityHeaders(response)
      }
    }
  } catch {
    return applySecurityHeaders(
      NextResponse.json({ error: 'Too Many Requests' }, { status: 429 })
    )
  }

  const response = NextResponse.next()
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value
  const roleCookie = request.cookies.get(ROLE_COOKIE_NAME)?.value
  const protectedRoutes = [
    { prefix: '/student', role: 'STUDENT' },
    { prefix: '/admin', role: 'ADMIN' },
    { prefix: '/trainer', role: 'TRAINER' },
    { prefix: '/recruiter', role: 'RECRUITER' },
  ] as const
  const roleSession = sessionCookie && roleCookie ? await verifyRoleCookie(roleCookie).catch(() => null) : null

  if (roleSession && (path === '/' || path === '/login')) {
    url.pathname = roleSession.mustChangePassword ? '/change-password' : getDashboardPath(roleSession.role)
    return applySecurityHeaders(NextResponse.redirect(url))
  }

  if (path === '/change-password') {
    if (!roleSession) {
      url.pathname = '/login'
      return applySecurityHeaders(NextResponse.redirect(url))
    }

    if (!roleSession.mustChangePassword) {
      url.pathname = getDashboardPath(roleSession.role)
      return applySecurityHeaders(NextResponse.redirect(url))
    }
  }

  const matchedProtectedRoute = protectedRoutes.find((route) => path === route.prefix || path.startsWith(`${route.prefix}/`))
  if (matchedProtectedRoute) {
    if (!roleSession) {
      url.pathname = '/login'
      url.searchParams.set('redirect', path)
      return applySecurityHeaders(NextResponse.redirect(url))
    }

    if (roleSession.mustChangePassword && path !== '/change-password') {
      url.pathname = '/change-password'
      return applySecurityHeaders(NextResponse.redirect(url))
    }

    if (roleSession.role !== matchedProtectedRoute.role) {
      url.pathname = getDashboardPath(roleSession.role)
      return applySecurityHeaders(NextResponse.redirect(url))
    }
  }

  if (path.startsWith('/admin/login') || path.startsWith('/student/login')) {
    url.pathname = '/login'
    return applySecurityHeaders(NextResponse.redirect(url))
  }

  return applySecurityHeaders(response)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
