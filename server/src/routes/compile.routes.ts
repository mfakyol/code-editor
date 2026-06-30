import { Router } from 'express'
import { compileHandler } from '../controllers/compile.controller'
import { validateCompileBody } from '../middleware/validateCompileBody'
import { rateLimit } from '../middleware/rateLimit'

const router = Router()

// Compilation runs preprocessors (Sass/Babel/Pug…) on the server's CPU, so
// cap how often a single client can hit it.
const compileLimiter = rateLimit({ windowMs: 60_000, max: 60 })

router.post('/compile', compileLimiter, validateCompileBody, compileHandler)

export default router
