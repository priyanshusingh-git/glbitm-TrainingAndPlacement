import { NextRequest, NextResponse } from "next/server"
import { getOrCreateCsrfToken, setCsrfCookie } from "@/lib/csrf"
import { isCaptchaRequired } from "@/lib/auth-rate-limit"
import { getIpAddress } from "@/lib/request-context"

export async function GET(req: NextRequest) {
  const csrf = await getOrCreateCsrfToken(req)
  const response = NextResponse.json({
    csrfToken: csrf.token,
    captchaRequired: await isCaptchaRequired(getIpAddress(req)),
  })

  response.headers.set("Cache-Control", "no-store")
  setCsrfCookie(response, csrf.signedCookie)

  return response
}
