import { describe, it, expect, vi } from 'vitest'
import type { Request, Response } from 'express'
import { rateLimit } from '../src/middleware/rateLimit'

// Minimal Express req/res doubles for exercising the middleware in isolation.
function fakeReqRes(ip: string) {
  const req = { ip } as Request
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    headers: {} as Record<string, string>,
    status(code: number) {
      this.statusCode = code
      return this
    },
    json(payload: unknown) {
      this.body = payload
      return this
    },
    setHeader(key: string, value: string) {
      this.headers[key] = value
    },
  } as unknown as Response & { statusCode: number; body: unknown }
  return { req, res }
}

describe('rateLimit middleware', () => {
  it('allows requests up to the limit, then blocks with 429', () => {
    const limiter = rateLimit({ windowMs: 60_000, max: 3 })
    const next = vi.fn()

    for (let i = 0; i < 3; i++) {
      const { req, res } = fakeReqRes('1.1.1.1')
      limiter(req, res, next)
    }
    expect(next).toHaveBeenCalledTimes(3)

    const { req, res } = fakeReqRes('1.1.1.1')
    limiter(req, res, next)
    expect(next).toHaveBeenCalledTimes(3) // not called a 4th time
    expect(res.statusCode).toBe(429)
    expect(res.headers['Retry-After']).toBeDefined()
  })

  it('tracks limits per client IP independently', () => {
    const limiter = rateLimit({ windowMs: 60_000, max: 1 })
    const next = vi.fn()

    const a = fakeReqRes('2.2.2.2')
    limiter(a.req, a.res, next)
    const b = fakeReqRes('3.3.3.3')
    limiter(b.req, b.res, next)

    expect(next).toHaveBeenCalledTimes(2)
    expect(a.res.statusCode).toBe(200)
    expect(b.res.statusCode).toBe(200)
  })

  it('resets after the window elapses', () => {
    vi.useFakeTimers()
    const limiter = rateLimit({ windowMs: 1_000, max: 1 })
    const next = vi.fn()

    const first = fakeReqRes('4.4.4.4')
    limiter(first.req, first.res, next)
    const blocked = fakeReqRes('4.4.4.4')
    limiter(blocked.req, blocked.res, next)
    expect(blocked.res.statusCode).toBe(429)

    vi.advanceTimersByTime(1_001)
    const afterWindow = fakeReqRes('4.4.4.4')
    limiter(afterWindow.req, afterWindow.res, next)
    expect(afterWindow.res.statusCode).toBe(200)

    vi.useRealTimers()
  })
})
