import type { Request, Response, NextFunction } from 'express'
import type { ZodType } from 'zod'
import { parse } from '../schemas/validate'

export function validate(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    req.body = parse(schema, req.body)
    next()
  }
}
