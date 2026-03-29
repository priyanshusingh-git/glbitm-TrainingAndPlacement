import { SignJWT, jwtVerify } from "jose";
import {
  ROLE_COOKIE_NAME,
  SESSION_COOKIE_NAME,
  getCookieTtlSeconds,
  signRoleCookie,
} from "@/lib/role-cookie";

type SessionRole = "ADMIN" | "STUDENT" | "TRAINER" | "RECRUITER";

const isProduction = process.env.NODE_ENV === "production";

const getJwtSecret = () => new TextEncoder().encode(process.env.JWT_SECRET || "default_super_secret_key_change_in_production");

export async function createSessionCookies(params: {
  uid: string;
  email: string;
  role: SessionRole;
  mustChangePassword: boolean;
  rememberMe: boolean;
}) {
  const expiresIn = getCookieTtlSeconds(params.rememberMe);

  // Mint a Native JWT replacing Firebase
  const sessionCookie = await new SignJWT({
    uid: params.uid,
    email: params.email,
    role: params.role.toLowerCase(), // match firebase role claim structure
    mustChangePassword: params.mustChangePassword
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresIn)
    .sign(getJwtSecret());

  const roleCookie = await signRoleCookie(
    {
      uid: params.uid,
      role: params.role,
      mustChangePassword: params.mustChangePassword,
      rememberMe: params.rememberMe,
    },
    params.rememberMe
  );

  return {
    sessionCookie,
    roleCookie,
    maxAge: expiresIn,
  };
}

export function applySessionCookies(
  response: import("next/server").NextResponse,
  params: {
    sessionCookie: string;
    roleCookie: string;
    maxAge: number;
    rememberMe: boolean;
  }
) {
  response.cookies.set(SESSION_COOKIE_NAME, params.sessionCookie, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
    ...(params.rememberMe ? { maxAge: params.maxAge } : {}),
  });

  response.cookies.set(ROLE_COOKIE_NAME, params.roleCookie, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
    ...(params.rememberMe ? { maxAge: params.maxAge } : {}),
  });
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
  });

  response.cookies.set(ROLE_COOKIE_NAME, "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}

export async function verifyServerSession(sessionCookie: string) {
  const { payload } = await jwtVerify(sessionCookie, getJwtSecret());
  return payload as { uid: string; email: string; role: string; mustChangePassword: boolean };
}
