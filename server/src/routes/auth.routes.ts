import { Router } from 'express'
import { register, login, logout, me, changePassword } from '../controllers/auth.controller'
import { requireAuth } from '../middleware/requireAuth'
import { validate } from '../middleware/validate'
import { registerSchema, changePasswordSchema } from '../schemas/auth.schema'

const router = Router()

router.post('/register', validate(registerSchema), register)
router.post('/login', login)
router.post('/logout', logout)
router.get('/me', me)
router.post('/change-password', requireAuth, validate(changePasswordSchema), changePassword)

export default router
