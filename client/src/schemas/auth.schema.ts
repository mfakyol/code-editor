import { z } from 'zod'
import type { TranslationKey } from '@/i18n/translations'

const strongPassword = z
  .string()
  .min(8, 'auth.passwordShort')
  .regex(/[a-z]/, 'auth.passwordWeak')
  .regex(/[A-Z]/, 'auth.passwordWeak')
  .regex(/[0-9]/, 'auth.passwordWeak')

export const loginSchema = z.object({
  email: z.email('auth.emailInvalid'),
  password: z.string().min(1, 'auth.passwordRequired'),
})

export const registerSchema = z.object({
  email: z.email('auth.emailInvalid'),
  username: z
    .string()
    .trim()
    .min(3, 'auth.usernameShort')
    .max(64, 'auth.usernameLong')

    .regex(/^[a-zA-Z0-9_-]+$/, 'auth.usernameInvalid'),
  password: strongPassword,
})

export const changePasswordSchema = z
  .object({
    next: strongPassword,
    confirm: z.string(),
  })
  .refine((data) => data.next === data.confirm, {
    path: ['confirm'],
    message: 'account.mismatch',
  })

export function fieldErrors(error: z.ZodError): Record<string, TranslationKey> {
  const out: Record<string, TranslationKey> = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? '')
    if (key && !(key in out)) out[key] = issue.message as TranslationKey
  }
  return out
}
