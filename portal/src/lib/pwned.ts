import { createHash } from "crypto"

const PWNED_API_URL = "https://api.pwnedpasswords.com/range"

export async function isPwnedPassword(password: string): Promise<boolean> {
  const hash = createHash("sha1").update(password).digest("hex").toUpperCase()
  const prefix = hash.slice(0, 5)
  const suffix = hash.slice(5)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)

  try {
    const response = await fetch(`${PWNED_API_URL}/${prefix}`, {
      headers: {
        "Add-Padding": "true",
        "User-Agent": "GLBITM-TnP-Portal/1.0",
      },
      signal: controller.signal,
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`HIBP request failed with ${response.status}`)
    }

    const body = await response.text()
    return body
      .split("\n")
      .some((line) => line.split(":")[0]?.trim().toUpperCase() === suffix)
  } finally {
    clearTimeout(timeout)
  }
}
