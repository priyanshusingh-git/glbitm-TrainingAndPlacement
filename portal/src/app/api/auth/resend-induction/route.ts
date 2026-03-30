import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { sendWelcomeEmail } from "@/services/email.service";
import { logAuthEvent } from "@/lib/auth-audit";
import { getIpAddress, getUserAgent } from "@/lib/request-context";
import { createProblemResponse } from "@/lib/problem-details";

/**
 * POST /api/auth/resend-induction
 * Resends the magic induction link to a student if they haven't set a password yet.
 */
export async function POST(req: NextRequest) {
  const ip = getIpAddress(req);
  const userAgent = getUserAgent(req);

  try {
    const { email } = await req.json();

    if (!email) {
      return createProblemResponse(req, {
        status: 400,
        code: "VALIDATION_ERROR",
        title: "Email is required",
        detail: "Please enter your email address."
      });
    }

    // 1. Find user and check if they still need to change password (induction pending)
    const user = await prisma.user.findUnique({
      where: { email },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        mustChangePassword: true,
        password: true // To check if they actually have a password set
      }
    });

    // 2. Security Check: Only allow resend if they have NO password set OR mustChangePassword is true
    // In our system, new students have a generated password but mustChangePassword is true.
    // If they already set a password (mustChangePassword: false), they should use Forgot Password.
    if (!user || !user.mustChangePassword) {
      // For security, don't reveal if the user exists but isn't eligible for resend.
      // Just say "If an induction is pending, a link has been sent."
      return NextResponse.json({ 
        message: "If an induction is pending for this account, a new link has been sent." 
      });
    }

    // 3. Generate new magic token
    const magicToken = crypto.randomUUID();
    const magicTokenExpires = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

    await prisma.user.update({
      where: { id: user.id },
      data: {
        magicToken,
        magicTokenExpires
      }
    });

    // 4. Send the welcome email again (Magic Link only)
    await sendWelcomeEmail(user.email, user.name || "Student", "", magicToken);

    // 5. Audit Logging
    await logAuthEvent({
      action: "LOGIN_FAILED",
      ip,
      userId: user.id,
      email: user.email,
      userAgent,
      metadata: { reason: "induction_resend_requested" }
    });

    return NextResponse.json({ 
      detail: "A secure reset code has been sent to your email." 
    });

  } catch (error: any) {
    console.error("Resend Induction Error:", error);
    return createProblemResponse(req, {
      status: 500,
      code: "INTERNAL_ERROR",
      title: "Service Error",
      detail: "We couldn't resend clinical induction link right now. Please try again later."
    });
  }
}
