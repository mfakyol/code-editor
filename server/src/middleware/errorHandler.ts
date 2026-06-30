import type { Request, Response, NextFunction } from 'express'
import { env } from '../config/env'

// MongoDB raises code 11000 when a unique index is violated.
function isDuplicateKeyError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    (err as { code?: number }).code === 11000
  )
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (env.isDev && err instanceof Error) {
    console.error(err.stack)
  } else {
    console.error(err)
  }

  // A race past the pre-checks (e.g. two registrations with the same email or
  // username at once) surfaces here — report it as a conflict, not a 500.
  if (isDuplicateKeyError(err)) {
    res.status(409).json({ message: 'Already exists' })
    return
  }

  res.status(500).json({ message: 'Internal server error' })
}
