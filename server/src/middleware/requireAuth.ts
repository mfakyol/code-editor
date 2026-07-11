import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../errors/AppError'

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  if (req.isAuthenticated && req.isAuthenticated()) {
    next()
    return
  }
  throw new AppError(401, 'Authentication required', 'UNAUTHENTICATED')
}
