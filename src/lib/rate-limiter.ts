/**
 * Simple in-memory rate limiter with sliding window for Next.js route handlers.
 * Compatible with Node.js and Edge runtimes.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Periodic cleanup every 10 minutes to prevent memory leak
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (record.resetAt <= now) {
        rateLimitStore.delete(key);
      }
    }
  }, 10 * 60 * 1000).unref?.();
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
}

/**
 * Checks and increments rate limit for a specific key (e.g. IP + action).
 * @param key unique identifier (e.g. "contact:192.168.1.1")
 * @param maxRequests maximum allowed requests in the time window
 * @param windowSeconds length of the window in seconds
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number
): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const record = rateLimitStore.get(key);

  if (!record || record.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetSeconds: windowSeconds,
    };
  }

  if (record.count >= maxRequests) {
    const resetSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
    return {
      allowed: false,
      remaining: 0,
      resetSeconds,
    };
  }

  record.count += 1;
  const resetSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetSeconds,
  };
}

/**
 * Extracts client IP from standard request headers.
 */
export function getClientIp(req: Request): string {
  const xForwardedFor = req.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    const first = xForwardedFor.split(',')[0].trim();
    if (first) return first;
  }
  const xRealIp = req.headers.get('x-real-ip');
  if (xRealIp) return xRealIp.trim();
  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp.trim();
  return '127.0.0.1';
}

