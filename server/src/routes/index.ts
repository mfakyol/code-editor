import { Router } from 'express'
import compileRoutes from './compile.routes'
import authRoutes from './auth.routes'
import penRoutes from './pen.routes'
import userRoutes from './user.routes'

const router = Router()

router.use(compileRoutes)
router.use('/auth', authRoutes)
router.use('/pens', penRoutes)
router.use('/users', userRoutes)

export default router
