import type { Request, Response, NextFunction } from 'express'
import passport from 'passport'
import type { z } from 'zod'
import { User, hashPassword, verifyPassword } from '../models/User'
import { AppError } from '../errors/AppError'
import type { registerSchema, changePasswordSchema } from '../schemas/auth.schema'

type PublicUser = { id: string; email: string; username: string }

function toPublicUser(user: Express.User): PublicUser {
  return { id: user.id, email: user.email, username: user.username }
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, username, password } = req.body as z.infer<typeof registerSchema>

    const existing = await User.findOne({ email })
    if (existing) {
      throw new AppError(409, 'Email already registered', 'EMAIL_TAKEN')
    }

    const usernameTaken = await User.findOne({ username })
    if (usernameTaken) {
      throw new AppError(409, 'Username already taken', 'USERNAME_TAKEN')
    }

    const passwordHash = await hashPassword(password)
    const user = await User.create({ email, username, passwordHash })

    req.login(user, (err) => {
      if (err) {
        next(err)
        return
      }
      res.status(201).json({ user: toPublicUser(user as unknown as Express.User) })
    })
  } catch (error) {
    next(error)
  }
}

export function login(req: Request, res: Response, next: NextFunction): void {
  passport.authenticate(
    'local',
    (err: unknown, user: Express.User | false, info?: { message?: string }) => {
      if (err) {
        next(err)
        return
      }
      if (!user) {
        next(new AppError(401, info?.message ?? 'Login failed', 'LOGIN_FAILED'))
        return
      }
      req.login(user, (loginErr) => {
        if (loginErr) {
          next(loginErr)
          return
        }
        res.json({ user: toPublicUser(user) })
      })
    },
  )(req, res, next)
}

export function logout(req: Request, res: Response, next: NextFunction): void {
  req.logout((err) => {
    if (err) {
      next(err)
      return
    }
    req.session.destroy(() => {
      res.clearCookie('connect.sid')
      res.json({ ok: true })
    })
  })
}

export function me(req: Request, res: Response): void {
  if (req.isAuthenticated() && req.user) {
    res.json({ user: toPublicUser(req.user) })
    return
  }
  res.json({ user: null })
}

export async function changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { currentPassword, newPassword } = req.body as z.infer<typeof changePasswordSchema>

    const user = await User.findById(req.user!.id)
    if (!user) {
      throw new AppError(404, 'User not found', 'USER_NOT_FOUND')
    }

    const valid = await verifyPassword(currentPassword, user.passwordHash)
    if (!valid) {
      throw new AppError(401, 'Current password is incorrect', 'INVALID_CREDENTIALS')
    }

    user.passwordHash = await hashPassword(newPassword)
    await user.save()
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
}
