import { Router } from 'express'
import {
  register,
  login,
  logout,
  me,
  changePassword,
} from '../controllers/auth.controller'
import { requireAuth } from '../middleware/requireAuth'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)
router.get('/me', me)
router.post('/change-password', requireAuth, changePassword)

export default router
