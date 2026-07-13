import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth'
import { validate } from '../middleware/validate'
import { penSchema, visibilitySchema } from '../schemas/pen.schema'
import { commentSchema } from '../schemas/comment.schema'
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
import { toggleLike, listComments, addComment, deleteComment } from '../controllers/social.controller'

const router = Router()

router.get('/public', listPublicPens)
router.get('/:id', getPen)
router.get('/:id/comments', listComments)

router.use(requireAuth)

router.get('/', listPens)
router.post('/', validate(penSchema), createPen)
router.post('/:id/fork', forkPen)
router.put('/:id', validate(penSchema), updatePen)
router.patch('/:id/visibility', validate(visibilitySchema), setVisibility)
router.delete('/:id', deletePen)

router.post('/:id/like', toggleLike)
router.post('/:id/comments', validate(commentSchema), addComment)
router.delete('/:id/comments/:commentId', deleteComment)

export default router
