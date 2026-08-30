import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/db"
import { inductionResendLimiter } from "@/lib/auth-rate-limit"
import { validateCsrfToken } from "@/lib/csrf"
import { sendWelcomeEmail } from "@/services/email.service"
import { logAuthEvent } from "@/lib/auth-audit"
import { getIpAddress, getUserAgent } from "@/lib/request-context"
import { createProblemResponse, handleApiError } from "@/lib/problem-details"

const requestSchema = z.object({
  email: z.string().email().max(255).transform((value) => value.trim().toLowerCase()),
  csrfToken: z.string().length(64).optional(),
})

const GENERIC_MESSAGE = "If an induction is pending for this account, a new link has been sent."

export async function POST(req: NextRequest) {
  const ip = getIpAddress(req)
  const userAgent = getUserAgent(req)

  try {
    const body = await req.json().catch(() => null)
    const parsed = requestSchema.safeParse(body)

    if (!parsed.success) {
      return createProblemResponse(req, {
        status: 400,
        code: "VALIDATION_ERROR",
        title: "Invalid request",
        detail: "Please enter a valid email address.",
      })
    }

    const csrfToken = parsed.data.csrfToken ?? req.headers.get("x-csrf-token")
    if (!(await validateCsrfToken(req, csrfToken))) {
      return createProblemResponse(req, {
        status: 403,
        code: "CSRF_INVALID",
        title: "Security validation failed",
        detail: "Security validation failed.",
      })
    }

    const rateLimit = await inductionResendLimiter.limit(ip)
    if (!rateLimit.success) {
      return NextResponse.json({ message: GENERIC_MESSAGE }, { status: 200 })
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true, email: true, name: true, mustChangePassword: true },
    })

    if (!user || !user.mustChangePassword) {
      return NextResponse.json({ message: GENERIC_MESSAGE })
    }

    const magicToken = crypto.randomUUID()
    const magicTokenExpires = new Date(Date.now() + 48 * 60 * 60 * 1000)

    await prisma.user.update({
      where: { id: user.id },
      data: { magicToken, magicTokenExpires },
    })

    await sendWelcomeEmail(user.email, user.name || "Student", "", magicToken)
    await logAuthEvent({
      action: "LOGIN_FAILED",
      ip,
      userId: user.id,
      email: user.email,
      userAgent,
      metadata: { reason: "induction_resend_requested" },
    })

    return NextResponse.json({ message: GENERIC_MESSAGE })
  } catch (error) {
    return handleApiError(req, error, {
      event: "auth.induction_resend.failed",
      message: "Induction resend failed",
      context: { ip, userAgent },
    })
  }
}
