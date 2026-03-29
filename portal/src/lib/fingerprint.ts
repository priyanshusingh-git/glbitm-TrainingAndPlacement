"use client"

async function sha256(value: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value)
  )

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

function buildFallbackFingerprintSource() {
  return [
    navigator.userAgent,
    navigator.language,
    navigator.platform,
    window.screen.width,
    window.screen.height,
    window.screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.hardwareConcurrency ?? "na",
  ].join("|")
}

export async function generateDeviceFingerprint() {
  if (typeof window === "undefined") {
    return ""
  }

  try {
    const FingerprintJS = (await import("@fingerprintjs/fingerprintjs")).default
    const agent = await FingerprintJS.load()
    const result = await agent.get()

    return result.visitorId.slice(0, 64)
  } catch {
    return (await sha256(buildFallbackFingerprintSource())).slice(0, 64)
  }
}
