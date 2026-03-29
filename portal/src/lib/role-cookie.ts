import { SignJWT, jwtVerify } from "jose"

export const SESSION_COOKIE_NAME = "__session"
export const ROLE_COOKIE_NAME = "__role"

type Role = "ADMIN" | "STUDENT" | "TRAINER" | "RECRUITER"

export type RoleCookiePayload = {
  uid: string
  role: Role
  mustChangePassword: boolean
  rememberMe: boolean
}

const SESSION_TTL_SECONDS = 12 * 60 * 60
const REMEMBER_ME_TTL_SECONDS = 14 * 24 * 60 * 60

function getRoleCookieSecret() {
  return new TextEncoder().encode(process.env.CSRF_SECRET)
}

export function getCookieTtlSeconds(rememberMe: boolean) {
  return rememberMe ? REMEMBER_ME_TTL_SECONDS : SESSION_TTL_SECONDS
}

export function getDashboardPath(role: Role) {
  if (role === "ADMIN") return "/admin"
  if (role === "TRAINER") return "/trainer"
  if (role === "RECRUITER") return "/recruiter"
  return "/student"
}

export async function signRoleCookie(
  payload: RoleCookiePayload,
  rememberMe: boolean
) {
  const ttl = getCookieTtlSeconds(rememberMe)

  return new SignJWT({
    uid: payload.uid,
    role: payload.role,
    mustChangePassword: payload.mustChangePassword,
    rememberMe: payload.rememberMe,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.uid)
    .setIssuedAt()
    .setExpirationTime(`${ttl}s`)
    .sign(getRoleCookieSecret())
}

export async function verifyRoleCookie(token: string) {
  const { payload } = await jwtVerify(token, getRoleCookieSecret())

  return {
    uid: String(payload.uid),
    role: payload.role as Role,
    mustChangePassword: Boolean(payload.mustChangePassword),
    rememberMe: Boolean(payload.rememberMe),
  }
}
