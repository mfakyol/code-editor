import type { Request, Response, NextFunction } from 'express'
import { env } from '../config/env'
import { AppError } from '../errors/AppError'

function isDuplicateKeyError(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.status).json({
      title: err.message,
      status: err.status,
      code: err.code,
      ...(err.errors.length > 0 ? { errors: err.errors } : {}),
    })
    return
  }

  if (isDuplicateKeyError(err)) {
    res.status(409).json({ title: 'Already exists', status: 409, code: 'DUPLICATE' })
    return
  }

  if (env.isDev && err instanceof Error) {
    console.error(err.stack)
  } else {
    console.error(err)
  }

  res.status(500).json({ title: 'Internal server error', status: 500, code: 'INTERNAL' })
}
