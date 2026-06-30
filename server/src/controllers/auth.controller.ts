import type { Request, Response, NextFunction } from 'express'
import passport from 'passport'
import {
  User,
  hashPassword,
  verifyPassword,
} from '../models/User'

type PublicUser = { id: string; email: string; username: string }

function toPublicUser(user: Express.User): PublicUser {
  return { id: user.id, email: user.email, username: user.username }
}

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const email = String(req.body?.email ?? '')
      .toLowerCase()
      .trim()
    const username = String(req.body?.username ?? '').trim()
    const password = String(req.body?.password ?? '')

    const errors: string[] = []
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      errors.push('A valid email is required')
    }
    if (username.length < 2) {
      errors.push('Username must be at least 2 characters')
    }
    if (password.length < 6) {
      errors.push('Password must be at least 6 characters')
    }
    if (errors.length > 0) {
      res.status(400).json({ message: 'Invalid input', errors })
      return
    }

    const existing = await User.findOne({ email })
    if (existing) {
      res.status(409).json({ message: 'Email already registered' })
      return
    }

    const usernameTaken = await User.findOne({ username })
    if (usernameTaken) {
      res.status(409).json({ message: 'Username already taken' })
      return
    }

    const passwordHash = await hashPassword(password)
    const user = await User.create({ email, username, passwordHash })

    // Log the new user in immediately.
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
        res.status(401).json({ message: info?.message ?? 'Login failed' })
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

export async function changePassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const currentPassword = String(req.body?.currentPassword ?? '')
    const newPassword = String(req.body?.newPassword ?? '')

    if (newPassword.length < 6) {
      res
        .status(400)
        .json({ message: 'New password must be at least 6 characters' })
      return
    }

    const user = await User.findById(req.user!.id)
    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    const valid = await verifyPassword(currentPassword, user.passwordHash)
    if (!valid) {
      res.status(401).json({ message: 'Current password is incorrect' })
      return
    }

    user.passwordHash = await hashPassword(newPassword)
    await user.save()
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
}
