import { authAdmin } from "@/lib/firebase-admin"
import {
  ROLE_COOKIE_NAME,
  SESSION_COOKIE_NAME,
  getCookieTtlSeconds,
  signRoleCookie,
} from "@/lib/role-cookie"

type SessionRole = "ADMIN" | "STUDENT" | "TRAINER" | "RECRUITER"

const isProduction = process.env.NODE_ENV === "production"

export async function createSessionCookies(params: {
  idToken: string
  uid: string
  role: SessionRole
  mustChangePassword: boolean
  rememberMe: boolean
}) {
  const expiresIn = getCookieTtlSeconds(params.rememberMe) * 1000
  const sessionCookie = await authAdmin.createSessionCookie(params.idToken, {
    expiresIn,
  })

  const roleCookie = await signRoleCookie(
    {
      uid: params.uid,
      role: params.role,
      mustChangePassword: params.mustChangePassword,
      rememberMe: params.rememberMe,
    },
    params.rememberMe
  )

  return {
    sessionCookie,
    roleCookie,
    maxAge: getCookieTtlSeconds(params.rememberMe),
  }
}

export function applySessionCookies(
  response: import("next/server").NextResponse,
  params: {
    sessionCookie: string
    roleCookie: string
    maxAge: number
    rememberMe: boolean
  }
) {
  response.cookies.set(SESSION_COOKIE_NAME, params.sessionCookie, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
    ...(params.rememberMe ? { maxAge: params.maxAge } : {}),
  })

  response.cookies.set(ROLE_COOKIE_NAME, params.roleCookie, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
    ...(params.rememberMe ? { maxAge: params.maxAge } : {}),
  })
}

export function clearSessionCookies(
  response: import("next/server").NextResponse
) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  })

  response.cookies.set(ROLE_COOKIE_NAME, "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  })
}

export async function verifyServerSession(sessionCookie: string) {
  return authAdmin.verifySessionCookie(sessionCookie, true)
}
