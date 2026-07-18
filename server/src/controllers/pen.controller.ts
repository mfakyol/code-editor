import type { Request, Response, NextFunction } from 'express'
import { Types } from 'mongoose'
import type { z } from 'zod'
import { Pen } from '../models/Pen'
import { Like } from '../models/Like'
import { Comment } from '../models/Comment'
import { AppError } from '../errors/AppError'
import type { penSchema } from '../schemas/pen.schema'

type PenData = z.infer<typeof penSchema>

async function loadOwnedPen(req: Request) {
  const id = String(req.params.id)
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(404, 'Pen not found', 'PEN_NOT_FOUND')
  }
  const pen = await Pen.findById(id)
  if (!pen) {
    throw new AppError(404, 'Pen not found', 'PEN_NOT_FOUND')
  }
  if (String(pen.owner) !== req.user!.id) {
    throw new AppError(403, 'Not your pen', 'FORBIDDEN')
  }
  return pen
}

function paginationParams(req: Request, defaultLimit: number) {
  const limit = Math.min(Math.max(Number(req.query.limit) || defaultLimit, 1), 100)
  const offset = Math.max(Number(req.query.offset) || 0, 0)
  return { limit, offset }
}

export async function listPens(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { limit, offset } = paginationParams(req, 100)
    const pens = await Pen.find({ owner: req.user!.id })
      .sort({ updatedAt: -1 })
      .select('title isPublic updatedAt createdAt')
      .skip(offset)
      .limit(limit)
      .lean()
    res.json({ pens })
  } catch (error) {
    next(error)
  }
}

export async function listPublicPens(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { limit, offset } = paginationParams(req, 48)
    const popular = req.query.sort === 'popular'

    const pens = await Pen.aggregate([
      { $match: { isPublic: true } },
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'pen',
          as: 'likes',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'owner',
          foreignField: '_id',
          as: 'ownerDoc',
        },
      },
      {
        $project: {
          title: 1,
          html: 1,
          css: 1,
          js: 1,
          settings: 1,
          createdAt: 1,
          updatedAt: 1,
          likeCount: { $size: '$likes' },
          ownerName: { $arrayElemAt: ['$ownerDoc.username', 0] },
        },
      },
      { $sort: popular ? { likeCount: -1, updatedAt: -1 } : { updatedAt: -1 } },
      { $skip: offset },
      { $limit: limit },
    ])

    res.json({ pens })
  } catch (error) {
    next(error)
  }
}

export async function getPen(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!Types.ObjectId.isValid(String(req.params.id))) {
      throw new AppError(404, 'Pen not found', 'PEN_NOT_FOUND')
    }
    const pen = await Pen.findById(String(req.params.id)).lean()
    if (!pen) {
      throw new AppError(404, 'Pen not found', 'PEN_NOT_FOUND')
    }
    const isOwner = req.user ? String(pen.owner) === req.user.id : false
    if (!pen.isPublic && !isOwner) {
      throw new AppError(403, 'This pen is private', 'PEN_PRIVATE')
    }

    const penId = String(req.params.id)
    const [likeCount, commentCount, likedByMe] = await Promise.all([
      Like.countDocuments({ pen: penId }),
      Comment.countDocuments({ pen: penId }),
      req.user ? Like.exists({ pen: penId, user: req.user.id }).then(Boolean) : Promise.resolve(false),
    ])

    res.json({ pen, isOwner, likeCount, commentCount, likedByMe })
  } catch (error) {
    next(error)
  }
}

export async function forkPen(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!Types.ObjectId.isValid(String(req.params.id))) {
      throw new AppError(404, 'Pen not found', 'PEN_NOT_FOUND')
    }
    const source = await Pen.findById(String(req.params.id)).lean()
    if (!source) {
      throw new AppError(404, 'Pen not found', 'PEN_NOT_FOUND')
    }
    const isOwner = String(source.owner) === req.user!.id
    if (!source.isPublic && !isOwner) {
      throw new AppError(403, 'This pen is private', 'PEN_PRIVATE')
    }

    const fork = await Pen.create({
      owner: req.user!.id,
      title: source.title.endsWith('(fork)') ? source.title : `${source.title} (fork)`,
      isPublic: false,
      html: source.html,
      css: source.css,
      js: source.js,
      settings: source.settings,
    })
    res.status(201).json({ pen: fork })
  } catch (error) {
    next(error)
  }
}

export async function createPen(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = req.body as PenData
    const pen = await Pen.create({ ...data, owner: req.user!.id })
    res.status(201).json({ pen })
  } catch (error) {
    next(error)
  }
}

export async function updatePen(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const pen = await loadOwnedPen(req)
    pen.set(req.body as PenData)
    await pen.save()
    res.json({ pen })
  } catch (error) {
    next(error)
  }
}

export async function deletePen(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const pen = await loadOwnedPen(req)
    await pen.deleteOne()
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
}

export async function setVisibility(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const pen = await loadOwnedPen(req)
    pen.isPublic = (req.body as { isPublic: boolean }).isPublic
    await pen.save()
    res.json({ isPublic: pen.isPublic })
  } catch (error) {
    next(error)
  }
}
