import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth'
import {
  listPens,
  listPublicPens,
  getPen,
  forkPen,
  createPen,
  updatePen,
  deletePen,
  setVisibility,
} from '../controllers/pen.controller'
import {
  toggleLike,
  listComments,
  addComment,
  deleteComment,
} from '../controllers/social.controller'

const router = Router()

// Public reads: the explore gallery, opening a public pen, and reading its
// comments are all available without an account.
router.get('/public', listPublicPens)
router.get('/:id', getPen)
router.get('/:id/comments', listComments)

// Everything below requires an active session.
router.use(requireAuth)

router.get('/', listPens)
router.post('/', createPen)
router.post('/:id/fork', forkPen)
router.put('/:id', updatePen)
router.patch('/:id/visibility', setVisibility)
router.delete('/:id', deletePen)

router.post('/:id/like', toggleLike)
router.post('/:id/comments', addComment)
router.delete('/:id/comments/:commentId', deleteComment)

export default router
