import crypto from "crypto"
import { SignJWT, jwtVerify } from "jose"
import type { NextRequest, NextResponse } from "next/server"

export const CSRF_COOKIE_NAME = "__Host-glbitm-csrf"

const isProduction = process.env.NODE_ENV === "production"

function getCsrfSecret() {
  return new TextEncoder().encode(process.env.CSRF_SECRET)
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  if (leftBuffer.length !== rightBuffer.length) {
    return false
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer)
}

async function signCsrfCookie(token: string) {
  return new SignJWT({
    purpose: "csrf",
    token,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(getCsrfSecret())
}

async function verifyCsrfCookie(cookie: string) {
  const { payload } = await jwtVerify(cookie, getCsrfSecret())

  if (payload.purpose !== "csrf" || typeof payload.token !== "string") {
    throw new Error("Invalid CSRF cookie")
  }

  return payload.token
}

export async function issueCsrfToken() {
  const token = crypto.randomBytes(32).toString("hex")

  return {
    token,
    signedCookie: await signCsrfCookie(token),
  }
}

export function setCsrfCookie(response: NextResponse, signedCookie: string) {
  response.cookies.set(CSRF_COOKIE_NAME, signedCookie, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
    maxAge: 2 * 60 * 60,
  })
}

export async function getOrCreateCsrfToken(request: NextRequest) {
  const existing = request.cookies.get(CSRF_COOKIE_NAME)?.value

  if (existing) {
    try {
      const token = await verifyCsrfCookie(existing)

      return {
        token,
        signedCookie: existing,
        reused: true,
      }
    } catch {
      // Fall through and issue a fresh token.
    }
  }

  const next = await issueCsrfToken()

  return {
    token: next.token,
    signedCookie: next.signedCookie,
    reused: false,
  }
}

export async function validateCsrfToken(
  request: NextRequest,
  token: string | null | undefined
) {
  const cookie = request.cookies.get(CSRF_COOKIE_NAME)?.value

  if (!cookie || !token) {
    return false
  }

  try {
    const cookieToken = await verifyCsrfCookie(cookie)
    return safeEqual(cookieToken, token)
  } catch {
    return false
  }
}
