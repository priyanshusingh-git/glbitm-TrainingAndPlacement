export async function verifyHCaptchaToken(params: {
  token: string
  ip?: string
}) {
  if (!process.env.HCAPTCHA_SECRET_KEY) {
    return true
  }

  const body = new URLSearchParams({
    secret: process.env.HCAPTCHA_SECRET_KEY,
    response: params.token,
  })

  if (params.ip) {
    body.set("remoteip", params.ip)
  }

  const response = await fetch("https://hcaptcha.com/siteverify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  })

  if (!response.ok) {
    return false
  }

  const result = await response.json().catch(() => null)
  return Boolean(result?.success)
}
