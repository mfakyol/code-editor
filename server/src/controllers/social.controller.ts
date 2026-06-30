import type { Request, Response, NextFunction } from 'express'
import { Types } from 'mongoose'
import { Pen } from '../models/Pen'
import { Like } from '../models/Like'
import { Comment } from '../models/Comment'

// Loads a pen the requester is allowed to see (public, or owned by them).
// Returns null and sends the appropriate 404/403 when access is denied.
async function loadAccessiblePen(req: Request, res: Response) {
  const id = String(req.params.id)
  if (!Types.ObjectId.isValid(id)) {
    res.status(404).json({ message: 'Pen not found' })
    return null
  }
  const pen = await Pen.findById(id).select('owner isPublic').lean()
  if (!pen) {
    res.status(404).json({ message: 'Pen not found' })
    return null
  }
  const isOwner = req.user ? String(pen.owner) === req.user.id : false
  if (!pen.isPublic && !isOwner) {
    res.status(403).json({ message: 'This pen is private' })
    return null
  }
  return pen
}

// Toggle the current user's like on a pen. Returns the new state + total.
export async function toggleLike(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const pen = await loadAccessiblePen(req, res)
    if (!pen) return

    if (String(pen.owner) === req.user!.id) {
      res.status(400).json({ message: 'You cannot like your own pen' })
      return
    }

    const penId = String(req.params.id)
    const filter = { pen: penId, user: req.user!.id }
    const existing = await Like.findOne(filter)

    let liked: boolean
    if (existing) {
      await existing.deleteOne()
      liked = false
    } else {
      await Like.create(filter)
      liked = true
    }

    const likeCount = await Like.countDocuments({ pen: penId })
    res.json({ liked, likeCount })
  } catch (error) {
    next(error)
  }
}

export async function listComments(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const pen = await loadAccessiblePen(req, res)
    if (!pen) return

    const comments = await Comment.find({ pen: String(req.params.id) })
      .sort({ createdAt: -1 })
      .populate('user', 'username')
      .lean()

    res.json({ comments })
  } catch (error) {
    next(error)
  }
}

export async function addComment(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const pen = await loadAccessiblePen(req, res)
    if (!pen) return

    const body = String((req.body as { body?: unknown })?.body ?? '').trim()
    if (!body) {
      res.status(400).json({ message: 'Comment cannot be empty' })
      return
    }
    if (body.length > 2000) {
      res.status(400).json({ message: 'Comment is too long (max 2000)' })
      return
    }

    const created = await Comment.create({
      pen: String(req.params.id),
      user: req.user!.id,
      body,
    })
    const comment = await created.populate('user', 'username')
    res.status(201).json({ comment })
  } catch (error) {
    next(error)
  }
}

// A comment can be removed by its author or by the pen's owner.
export async function deleteComment(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id, commentId } = req.params
    if (
      !Types.ObjectId.isValid(String(id)) ||
      !Types.ObjectId.isValid(String(commentId))
    ) {
      res.status(404).json({ message: 'Comment not found' })
      return
    }

    const comment = await Comment.findOne({ _id: commentId, pen: id })
    if (!comment) {
      res.status(404).json({ message: 'Comment not found' })
      return
    }

    const pen = await Pen.findById(id).select('owner').lean()
    const isAuthor = String(comment.user) === req.user!.id
    const isPenOwner = pen ? String(pen.owner) === req.user!.id : false
    if (!isAuthor && !isPenOwner) {
      res.status(403).json({ message: 'Not allowed' })
      return
    }

    await comment.deleteOne()
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
}
