import { Router } from 'express'
import compileRoutes from './compile.routes'

const router = Router()

router.use(compileRoutes)

export default router
