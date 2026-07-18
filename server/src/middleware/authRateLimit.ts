import type { Request } from 'express'
import { rateLimit } from './rateLimit'

const FIFTEEN_MINUTES = 15 * 60_000

function normalizedEmail(req: Request): string {
  const email = (req.body as { email?: unknown })?.email
  return typeof email === 'string' ? email.toLowerCase().trim() : ''
}

export const loginRateLimit = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  max: 5,
  countFailuresOnly: true,
  keyGenerator: (req) => `login:${req.ip ?? 'unknown'}:${normalizedEmail(req)}`,
})

export const registerRateLimit = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  max: 10,
  countFailuresOnly: true,
  keyGenerator: (req) => `register:${req.ip ?? 'unknown'}:${normalizedEmail(req)}`,
})

export const changePasswordRateLimit = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  max: 5,
  countFailuresOnly: true,
  keyGenerator: (req) => `change-password:${req.user?.id ?? req.ip ?? 'unknown'}`,
})
