import type { Request, Response, NextFunction } from 'express'
import { env } from '../config/env'

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

  res.status(500).json({ message: 'Internal server error' })
}
