import type { Request, Response, NextFunction } from 'express'

type Options = {
  windowMs: number
  max: number
}

type Bucket = {
  count: number
  resetAt: number
}

// Minimal in-memory fixed-window rate limiter. Keyed by client IP. Good enough
// to stop a single client from hammering the (CPU-heavy) compile endpoint;
// swap for a Redis-backed limiter if the server is ever horizontally scaled.
export function rateLimit({ windowMs, max }: Options) {
  const buckets = new Map<string, Bucket>()

  // Periodically drop expired buckets so the map cannot grow unbounded.
  const sweep = setInterval(() => {
    const now = Date.now()
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key)
    }
  }, windowMs)
  sweep.unref?.()

  return function rateLimiter(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    const key = req.ip ?? 'unknown'
    const now = Date.now()
    const bucket = buckets.get(key)

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs })
      next()
      return
    }

    bucket.count += 1
    if (bucket.count > max) {
      const retryAfter = Math.ceil((bucket.resetAt - now) / 1000)
      res.setHeader('Retry-After', String(retryAfter))
      res.status(429).json({
        title: `Too many requests — try again in ${retryAfter}s`,
        status: 429,
        code: 'RATE_LIMITED',
      })
      return
    }

    next()
  }
}
