import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { createSessionCookies, applySessionCookies } from "@/lib/session";
import { logAuthEvent } from "@/lib/auth-audit";
import { getIpAddress, getUserAgent } from "@/lib/request-context";

/**
 * GET /api/auth/magic?token=...
 * Authenticates a user via a one-time magic token and redirects to password reset.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  
  const ip = getIpAddress(req);
  const userAgent = getUserAgent(req);

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=Invalid link", req.url));
  }

  try {
    // 1. Find user with valid, non-expired magic token
    const user = await prisma.user.findFirst({
      where: {
        magicToken: token,
        magicTokenExpires: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        email: true,
        role: true,
        mustChangePassword: true,
      },
    });

    if (!user) {
      await logAuthEvent({
        action: "LOGIN_FAILED",
        ip,
        userAgent,
        metadata: { reason: "invalid_or_expired_magic_token" },
      });
      return NextResponse.redirect(
        new URL("/login?error=This link has expired or is invalid.", req.url)
      );
    }

    // 2. Clear the token immediately (One-time use)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        magicToken: null,
        magicTokenExpires: null,
      },
    });

    // 3. Create Session Cookies
    const cookieData = await createSessionCookies({
      uid: user.id,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
      rememberMe: false, // Magic links are usually session-bound for security
    });

    // 4. Prepare Success Redirect
    // Since it's a new student, they should always land on change-password
    const targetPath = "/change-password";
    const response = NextResponse.redirect(new URL(targetPath, req.url));

    applySessionCookies(response, {
      ...cookieData,
      rememberMe: false,
    });

    // 5. Audit Logging
    await logAuthEvent({
      action: "LOGIN_SUCCESS",
      ip,
      userId: user.id,
      email: user.email,
      userAgent,
      metadata: { method: "magic_link", role: user.role },
    });

    return response;
  } catch (error: any) {
    console.error("Magic Login Error:", error);
    return NextResponse.redirect(
      new URL("/login?error=An unexpected error occurred. Please try again.", req.url)
    );
  }
}
