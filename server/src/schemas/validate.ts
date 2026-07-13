import type { ZodType } from 'zod'
import { AppError } from '../errors/AppError'

export function parse<T>(schema: ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    throw new AppError(
      400,
      'Invalid input',
      'VALIDATION',
      result.error.issues.map((issue) => issue.message),
    )
  }
  return result.data
}
