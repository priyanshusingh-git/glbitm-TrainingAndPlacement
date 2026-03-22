import { Ratelimit } from "@upstash/ratelimit"
import { redis } from "@/lib/redis"

/**
 * Creates a Redis-backed rate limiter using Upstash.
 *
 * The previous in-memory implementation (using `limiter` package with a Map)
 * provided zero protection on Vercel serverless — each cold start had an empty Map.
 *
 * This implementation shares state across all serverless invocations via Redis.
 */
export function createRateLimiter(
  requests: number,
  window: Parameters<typeof Ratelimit.slidingWindow>[1],
  prefix: string
) {
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix,
  })
}
