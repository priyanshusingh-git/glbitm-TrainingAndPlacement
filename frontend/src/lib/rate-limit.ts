import { RateLimiter } from"limiter";

interface RateLimitConfig {
 interval: number; // in milliseconds
 uniqueTokenPerInterval: number; // Max requests per interval
}

export function rateLimit(config: RateLimitConfig) {
 // Map to store limiters for each IP, scoped to this rateLimit instance
 const limiters = new Map<string, RateLimiter>();

 return {
 check: (limit: number, token: string) =>
 new Promise<void>((resolve, reject) => {
 if (!limiters.has(token)) {
 limiters.set(
 token,
 new RateLimiter({ tokensPerInterval: limit, interval:"minute" })
 );
 }

 const limiter = limiters.get(token);

 if (limiter && limiter.tryRemoveTokens(1)) {
 resolve();
 } else {
 reject();
 }
 }),
 };
}
