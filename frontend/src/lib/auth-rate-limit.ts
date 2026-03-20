import { Ratelimit } from "@upstash/ratelimit"
import { redis } from "@/lib/redis"

export const loginIpLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 h"),
  prefix: "rl:ip:login",
})

export const loginComboLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 m"),
  prefix: "rl:ip-email:login",
})

export const loginFingerprintLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 h"),
  prefix: "rl:fingerprint:login",
})

export const otpRequestLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  prefix: "rl:ip:otp",
})

export const passwordResetLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"),
  prefix: "rl:ip:password-reset",
})

export const generalApiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(200, "1 m"),
  prefix: "rl:ip:api",
})

function getIpFailureKey(ip: string) {
  return `auth:fail:ip:${ip}`
}

function getFingerprintFailureKey(fingerprint: string) {
  return `auth:fail:fingerprint:${fingerprint}`
}

function getFailureKey(email: string) {
  return `auth:fail:email:${email}`
}

function getBlockedIpKey(ip: string) {
  return `auth:block:ip:${ip}`
}

function getIpEmailSetKey(ip: string) {
  return `auth:emails:${ip}`
}

export async function recordPasswordFailure(email: string) {
  const key = getFailureKey(email)
  const count = await redis.incr(key)

  if (count === 1) {
    await redis.expire(key, 60 * 60)
  }

  return Number(count)
}

export async function clearPasswordFailures(email: string) {
  await redis.del(getFailureKey(email))
}

async function recordWindowedFailure(key: string) {
  const count = await redis.incr(key)

  if (count === 1) {
    await redis.expire(key, 60 * 60)
  }

  return Number(count)
}

export async function recordLoginFailure(params: {
  ip: string
  email: string
  fingerprint?: string | null
}) {
  const [emailFailureCount, ipFailureCount, fingerprintFailureCount] =
    await Promise.all([
      recordPasswordFailure(params.email),
      recordWindowedFailure(getIpFailureKey(params.ip)),
      params.fingerprint
        ? recordWindowedFailure(getFingerprintFailureKey(params.fingerprint))
        : Promise.resolve(0),
    ])

  return {
    emailFailureCount,
    ipFailureCount,
    fingerprintFailureCount,
    captchaRequired: ipFailureCount >= 3,
  }
}

export async function clearLoginFailures(params: {
  ip: string
  email: string
  fingerprint?: string | null
}) {
  await Promise.all([
    clearPasswordFailures(params.email),
    redis.del(getIpFailureKey(params.ip)),
    params.fingerprint
      ? redis.del(getFingerprintFailureKey(params.fingerprint))
      : Promise.resolve(0),
  ])
}

export async function getIpFailureCount(ip: string) {
  const count = await redis.get<number>(getIpFailureKey(ip))
  return Number(count ?? 0)
}

export async function isCaptchaRequired(ip: string) {
  return (await getIpFailureCount(ip)) >= 3
}

export async function trackCredentialStuffing(ip: string, email: string) {
  const key = getIpEmailSetKey(ip)
  await redis.sadd(key, email.trim().toLowerCase())
  await redis.expire(key, 10 * 60)
  const uniqueEmails = Number(await redis.scard(key))

  if (uniqueEmails > 5) {
    await blockIp(ip, 24 * 60 * 60)
    return { blocked: true, uniqueEmails }
  }

  return { blocked: false, uniqueEmails }
}

export async function blockIp(ip: string, seconds: number) {
  await redis.set(getBlockedIpKey(ip), "1", { ex: seconds })
}

export async function getBlockedIpRetryAfter(ip: string) {
  const ttl = await redis.ttl(getBlockedIpKey(ip))
  return Math.max(0, Number(ttl ?? 0))
}

export async function isIpBlocked(ip: string) {
  const retryAfter = await getBlockedIpRetryAfter(ip)

  return {
    blocked: retryAfter > 0,
    retryAfter,
  }
}

export function getProgressiveDelayMs(failureCount: number) {
  if (failureCount >= 9) return 15000
  if (failureCount >= 7) return 10000
  if (failureCount >= 5) return 5000
  if (failureCount >= 3) return 2000
  return 0
}

export async function applyProgressiveDelay(failureCount: number) {
  const delay = getProgressiveDelayMs(failureCount)

  if (delay > 0) {
    await new Promise((resolve) => setTimeout(resolve, delay))
  }
}

export function applyRateLimitHeaders(
  response: import("next/server").NextResponse,
  rateLimitResult: {
    limit?: number
    remaining?: number
    reset?: number
  },
  retryAfter?: number
) {
  if (typeof rateLimitResult.limit === "number") {
    response.headers.set("X-RateLimit-Limit", String(rateLimitResult.limit))
  }

  if (typeof rateLimitResult.remaining === "number") {
    response.headers.set(
      "X-RateLimit-Remaining",
      String(Math.max(0, rateLimitResult.remaining))
    )
  }

  if (typeof rateLimitResult.reset === "number") {
    response.headers.set(
      "X-RateLimit-Reset",
      String(Math.floor(rateLimitResult.reset / 1000))
    )
  }

  if (typeof retryAfter === "number" && retryAfter > 0) {
    response.headers.set("Retry-After", String(retryAfter))
  }
}
