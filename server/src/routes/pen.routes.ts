import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth'
import {
  listPens,
  getPen,
  forkPen,
  createPen,
  updatePen,
  deletePen,
} from '../controllers/pen.controller'

const router = Router()

// Public read: anyone may open a public pen (owner may open their private ones).
router.get('/:id', getPen)

// Everything below requires an active session.
router.use(requireAuth)

router.get('/', listPens)
router.post('/', createPen)
router.post('/:id/fork', forkPen)
router.put('/:id', updatePen)
router.delete('/:id', deletePen)

export default router
