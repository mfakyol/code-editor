import { Router } from 'express'
import { compileHandler } from '../controllers/compile.controller'
import { validateCompileBody } from '../middleware/validateCompileBody'

const router = Router()

router.post('/compile', validateCompileBody, compileHandler)

export default router
