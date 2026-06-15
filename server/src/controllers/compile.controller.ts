import type { Request, Response, NextFunction } from 'express'
import { compileAll } from '../services/compile.service'
import type { CompileRequest } from '../types/compile.types'

export async function compileHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { html, css, js, settings } = req.body as CompileRequest
    const result = await compileAll({ html, css, js }, settings)
    res.json(result)
  } catch (e) {
    next(e)
  }
}
