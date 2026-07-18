import type { Request, Response, NextFunction } from 'express'

type Options = {
  windowMs: number
  max: number
  keyGenerator?: (req: Request) => string
  countFailuresOnly?: boolean
}

type Bucket = {
  count: number
  resetAt: number
}

const defaultKey = (req: Request): string => req.ip ?? 'unknown'

export function rateLimit({
  windowMs,
  max,
  keyGenerator = defaultKey,
  countFailuresOnly = false,
}: Options) {
  const buckets = new Map<string, Bucket>()

  const sweep = setInterval(() => {
    const now = Date.now()
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key)
    }
  }, windowMs)
  sweep.unref?.()

  function record(key: string, now: number): void {
    const bucket = buckets.get(key)
    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs })
      return
    }
    bucket.count += 1
  }

  function reject(res: Response, resetAt: number, now: number): void {
    const retryAfter = Math.ceil((resetAt - now) / 1000)
    res.setHeader('Retry-After', String(retryAfter))
    res.status(429).json({
      title: `Too many requests — try again in ${retryAfter}s`,
      status: 429,
      code: 'RATE_LIMITED',
    })
  }

  return function rateLimiter(req: Request, res: Response, next: NextFunction): void {
    const key = keyGenerator(req)
    const now = Date.now()

    if (countFailuresOnly) {
      const bucket = buckets.get(key)
      if (bucket && bucket.resetAt > now && bucket.count >= max) {
        reject(res, bucket.resetAt, now)
        return
      }
      res.on('finish', () => {
        if (res.statusCode >= 400) record(key, Date.now())
      })
      next()
      return
    }

    record(key, now)
    const bucket = buckets.get(key)!
    if (bucket.count > max) {
      reject(res, bucket.resetAt, now)
      return
    }
    next()
  }
}
