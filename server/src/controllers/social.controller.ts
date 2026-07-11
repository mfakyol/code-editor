import type { Request, Response, NextFunction } from 'express'
import { Types } from 'mongoose'
import { Pen } from '../models/Pen'
import { Like } from '../models/Like'
import { Comment } from '../models/Comment'
import { AppError } from '../errors/AppError'

async function loadAccessiblePen(req: Request) {
  const id = String(req.params.id)
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(404, 'Pen not found', 'PEN_NOT_FOUND')
  }
  const pen = await Pen.findById(id).select('owner isPublic').lean()
  if (!pen) {
    throw new AppError(404, 'Pen not found', 'PEN_NOT_FOUND')
  }
  const isOwner = req.user ? String(pen.owner) === req.user.id : false
  if (!pen.isPublic && !isOwner) {
    throw new AppError(403, 'This pen is private', 'PEN_PRIVATE')
  }
  return pen
}

export async function toggleLike(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const pen = await loadAccessiblePen(req)

    if (String(pen.owner) === req.user!.id) {
      throw new AppError(400, 'You cannot like your own pen', 'CANNOT_LIKE_OWN')
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

export async function listComments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await loadAccessiblePen(req)

    const comments = await Comment.find({ pen: String(req.params.id) })
      .sort({ createdAt: -1 })
      .populate('user', 'username')
      .lean()

    res.json({ comments })
  } catch (error) {
    next(error)
  }
}

export async function addComment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await loadAccessiblePen(req)

    const body = String((req.body as { body?: unknown })?.body ?? '').trim()
    if (!body) {
      throw new AppError(400, 'Comment cannot be empty', 'COMMENT_EMPTY')
    }
    if (body.length > 2000) {
      throw new AppError(400, 'Comment is too long (max 2000)', 'COMMENT_TOO_LONG')
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

export async function deleteComment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id, commentId } = req.params
    if (!Types.ObjectId.isValid(String(id)) || !Types.ObjectId.isValid(String(commentId))) {
      throw new AppError(404, 'Comment not found', 'COMMENT_NOT_FOUND')
    }

    const comment = await Comment.findOne({ _id: commentId, pen: id })
    if (!comment) {
      throw new AppError(404, 'Comment not found', 'COMMENT_NOT_FOUND')
    }

    const pen = await Pen.findById(id).select('owner').lean()
    const isAuthor = String(comment.user) === req.user!.id
    const isPenOwner = pen ? String(pen.owner) === req.user!.id : false
    if (!isAuthor && !isPenOwner) {
      throw new AppError(403, 'Not allowed', 'FORBIDDEN')
    }

    await comment.deleteOne()
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
}
