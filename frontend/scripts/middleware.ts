import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

// Limiters
const authLimiter = rateLimit({ uniqueTokenPerInterval: 500, interval: 60000 })
const generalLimiter = rateLimit({ uniqueTokenPerInterval: 1000, interval: 60000 })

export async function middleware(request: NextRequest) {
    const url = request.nextUrl.clone()
    const path = url.pathname
    const ip = (request.headers.get("x-forwarded-for") ?? "127.0.0.1").split(",")[0]

    // Rate Limiting
    try {
        if (path.startsWith('/api/auth') || path.startsWith('/login')) {
            await authLimiter.check(30, ip) // Increased from 5 to 30 requests per minute
        } else if (path.startsWith('/api')) {
            await generalLimiter.check(100, ip) // Increased from 60 to 100 requests per minute
        }
    } catch {
        return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 })
    }

    // Security Headers
    const response = NextResponse.next()

    // Handle authenticated redirection for landing and login pages
    const token = request.cookies.get('sb-access-token')?.value
    const role = request.cookies.get('sb-user-role')?.value

    if (token && role && (path === '/' || path === '/login')) {
        if (role === 'ADMIN' || role === 'STAFF') {
            url.pathname = '/admin'
            return NextResponse.redirect(url)
        }
        if (role === 'STUDENT') {
            url.pathname = '/student'
            return NextResponse.redirect(url)
        }
        if (role === 'TRAINER') {
            url.pathname = '/trainer'
            return NextResponse.redirect(url)
        }
    }

    // Redirect consolidated login pages to the main login page
    if (path.startsWith('/admin/login') || path.startsWith('/student/login')) {
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}
