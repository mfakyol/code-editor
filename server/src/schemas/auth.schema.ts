import { z } from 'zod'

const strongPassword = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must include upper, lower case and a number')
  .regex(/[A-Z]/, 'Password must include upper, lower case and a number')
  .regex(/[0-9]/, 'Password must include upper, lower case and a number')

export const registerSchema = z.object({
  email: z
    .string()
    .transform((value) => value.toLowerCase().trim())
    .pipe(z.string().regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/, 'A valid email is required')),
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(64, 'Username must be at most 64 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username may only contain letters, numbers, - and _'),
  password: strongPassword,
})

export const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: strongPassword,
})
