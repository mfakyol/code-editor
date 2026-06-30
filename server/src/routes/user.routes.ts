import { Router } from 'express'
import { getUserProfile } from '../controllers/user.controller'

const router = Router()

// Public profile pages.
router.get('/:username', getUserProfile)

export default router
