import { Router } from 'express'
import { compileHandler } from '../controllers/compile.controller'
import { validate } from '../middleware/validate'
import { compileSchema } from '../schemas/compile.schema'
import { rateLimit } from '../middleware/rateLimit'

const router = Router()

const compileLimiter = rateLimit({ windowMs: 60_000, max: 60 })

router.post('/compile', compileLimiter, validate(compileSchema), compileHandler)

export default router
