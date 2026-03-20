import { NextRequest, NextResponse } from "next/server"
import { validateCsrfToken } from "@/lib/csrf"
import { isPwnedPassword } from "@/lib/pwned"
import { attachRequestContextHeaders, getIpAddress, getUserAgent } from "@/lib/request-context"
import { createProblemResponse, handleApiError } from "@/lib/problem-details"

export async function POST(req: NextRequest) {
  const ip = getIpAddress(req)
  const userAgent = getUserAgent(req)

  try {
    const body = await req.json().catch(() => null)
    const password = body?.password
    const csrfToken = body?.csrfToken ?? req.headers.get("x-csrf-token")

    if (!(await validateCsrfToken(req, csrfToken))) {
      return createProblemResponse(req, {
        status: 403,
        code: "CSRF_INVALID",
        title: "Security validation failed",
        detail: "Security validation failed.",
      })
    }

    if (typeof password !== "string" || password.length < 8) {
      return createProblemResponse(req, {
        status: 400,
        code: "VALIDATION_ERROR",
        title: "Invalid request",
        detail: "Enter a password with at least 8 characters.",
      })
    }

    let breached = false

    try {
      breached = await isPwnedPassword(password)
    } catch {
      return createProblemResponse(req, {
        status: 503,
        code: "PASSWORD_CHECK_UNAVAILABLE",
        title: "Service temporarily unavailable",
        detail: "Password safety checks are temporarily unavailable. Please try again shortly.",
      })
    }

    return attachRequestContextHeaders(
      req,
      NextResponse.json({
        breached,
        message: breached
          ? "This password has appeared in known data breaches. Choose a different password."
          : "This password was not found in the Have I Been Pwned database.",
      })
    )
  } catch (error) {
    return handleApiError(req, error, {
      event: "auth.password_check.failed",
      message: "Password breach check failed",
      context: {
        ip,
        userAgent,
      },
    })
  }
}
