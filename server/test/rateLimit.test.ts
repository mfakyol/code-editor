import { describe, it, expect, vi } from 'vitest'
import type { Request, Response } from 'express'
import { rateLimit } from '../src/middleware/rateLimit'

// Minimal Express req/res doubles for exercising the middleware in isolation.
function fakeReqRes(ip: string, body: Record<string, unknown> = {}) {
  const req = { ip, body } as unknown as Request
  const finishHandlers: Array<() => void> = []
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
    on(event: string, cb: () => void) {
      if (event === 'finish') finishHandlers.push(cb)
      return this
    },
    finish(code: number) {
      this.statusCode = code
      for (const cb of finishHandlers) cb()
    },
  } as unknown as Response & {
    statusCode: number
    body: unknown
    finish(code: number): void
  }
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

describe('rateLimit countFailuresOnly', () => {
  it('does not charge successful responses', () => {
    const limiter = rateLimit({ windowMs: 60_000, max: 2, countFailuresOnly: true })
    const next = vi.fn()

    for (let i = 0; i < 10; i++) {
      const { req, res } = fakeReqRes('9.9.9.9')
      limiter(req, res, next)
      res.finish(200)
    }
    expect(next).toHaveBeenCalledTimes(10)
  })

  it('blocks after max failed responses within the window', () => {
    const limiter = rateLimit({ windowMs: 60_000, max: 3, countFailuresOnly: true })
    const next = vi.fn()

    for (let i = 0; i < 3; i++) {
      const { req, res } = fakeReqRes('8.8.8.8')
      limiter(req, res, next)
      res.finish(401)
    }
    expect(next).toHaveBeenCalledTimes(3)

    const blocked = fakeReqRes('8.8.8.8')
    limiter(blocked.req, blocked.res, next)
    expect(next).toHaveBeenCalledTimes(3)
    expect(blocked.res.statusCode).toBe(429)
    expect(blocked.res.headers['Retry-After']).toBeDefined()
  })
})

describe('rateLimit keyGenerator', () => {
  it('isolates budgets per derived key, not just per IP', () => {
    const limiter = rateLimit({
      windowMs: 60_000,
      max: 1,
      countFailuresOnly: true,
      keyGenerator: (req) => `${req.ip}:${(req.body as { email?: string }).email ?? ''}`,
    })
    const next = vi.fn()

    const a = fakeReqRes('7.7.7.7', { email: 'a@test.com' })
    limiter(a.req, a.res, next)
    a.res.finish(401)
    const b = fakeReqRes('7.7.7.7', { email: 'b@test.com' })
    limiter(b.req, b.res, next)
    b.res.finish(401)
    expect(next).toHaveBeenCalledTimes(2)

    const aAgain = fakeReqRes('7.7.7.7', { email: 'a@test.com' })
    limiter(aAgain.req, aAgain.res, next)
    expect(aAgain.res.statusCode).toBe(429)
  })
})
