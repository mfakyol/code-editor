import type { Request, Response, NextFunction } from 'express'
import { Types } from 'mongoose'
import { Pen } from '../models/Pen'
import { Like } from '../models/Like'
import { Comment } from '../models/Comment'

type PenInput = {
  title?: unknown
  isPublic?: unknown
  html?: unknown
  css?: unknown
  js?: unknown
  settings?: {
    htmlPreprocessor?: unknown
    cssPreprocessor?: unknown
    jsPreprocessor?: unknown
    externalScripts?: unknown
    externalStyles?: unknown
  }
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((x): x is string => typeof x === 'string')
    : []
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function normalizeBody(body: PenInput) {
  const s = body.settings ?? {}
  return {
    title: asString(body.title, 'Untitled Pen').trim() || 'Untitled Pen',
    isPublic: body.isPublic === true,
    html: asString(body.html),
    css: asString(body.css),
    js: asString(body.js),
    settings: {
      htmlPreprocessor: asString(s.htmlPreprocessor, 'none'),
      cssPreprocessor: asString(s.cssPreprocessor, 'none'),
      jsPreprocessor: asString(s.jsPreprocessor, 'none'),
      externalScripts: asStringArray(s.externalScripts),
      externalStyles: asStringArray(s.externalStyles),
    },
  }
}

// List the current user's pens (newest first, lightweight fields).
export async function listPens(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const pens = await Pen.find({ owner: req.user!.id })
      .sort({ updatedAt: -1 })
      .select('title isPublic updatedAt createdAt')
      .lean()
    res.json({ pens })
  } catch (error) {
    next(error)
  }
}

// Public explore gallery: every public pen with its owner + like count.
// ?sort=popular orders by likes, otherwise newest first. Includes source so
// the gallery can render live thumbnail previews.
export async function listPublicPens(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const limit = Math.min(Number(req.query.limit) || 48, 100)
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
      { $limit: limit },
    ])

    res.json({ pens })
  } catch (error) {
    next(error)
  }
}

export async function getPen(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!Types.ObjectId.isValid(String(req.params.id))) {
      res.status(404).json({ message: 'Pen not found' })
      return
    }
    const pen = await Pen.findById(String(req.params.id)).lean()
    if (!pen) {
      res.status(404).json({ message: 'Pen not found' })
      return
    }
    const isOwner = req.user ? String(pen.owner) === req.user.id : false
    if (!pen.isPublic && !isOwner) {
      res.status(403).json({ message: 'This pen is private' })
      return
    }

    const penId = String(req.params.id)
    const [likeCount, commentCount, likedByMe] = await Promise.all([
      Like.countDocuments({ pen: penId }),
      Comment.countDocuments({ pen: penId }),
      req.user
        ? Like.exists({ pen: penId, user: req.user.id }).then(Boolean)
        : Promise.resolve(false),
    ])

    res.json({ pen, isOwner, likeCount, commentCount, likedByMe })
  } catch (error) {
    next(error)
  }
}

// Create a copy of a pen (the source must be public or owned by the user).
export async function forkPen(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!Types.ObjectId.isValid(String(req.params.id))) {
      res.status(404).json({ message: 'Pen not found' })
      return
    }
    const source = await Pen.findById(String(req.params.id)).lean()
    if (!source) {
      res.status(404).json({ message: 'Pen not found' })
      return
    }
    const isOwner = String(source.owner) === req.user!.id
    if (!source.isPublic && !isOwner) {
      res.status(403).json({ message: 'This pen is private' })
      return
    }

    const fork = await Pen.create({
      owner: req.user!.id,
      title: `${source.title} (fork)`,
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

export async function createPen(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = normalizeBody(req.body as PenInput)
    const pen = await Pen.create({ ...data, owner: req.user!.id })
    res.status(201).json({ pen })
  } catch (error) {
    next(error)
  }
}

export async function updatePen(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!Types.ObjectId.isValid(String(req.params.id))) {
      res.status(404).json({ message: 'Pen not found' })
      return
    }
    const pen = await Pen.findById(String(req.params.id))
    if (!pen) {
      res.status(404).json({ message: 'Pen not found' })
      return
    }
    if (String(pen.owner) !== req.user!.id) {
      res.status(403).json({ message: 'Not your pen' })
      return
    }

    const data = normalizeBody(req.body as PenInput)
    pen.set(data)
    await pen.save()
    res.json({ pen })
  } catch (error) {
    next(error)
  }
}

export async function deletePen(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!Types.ObjectId.isValid(String(req.params.id))) {
      res.status(404).json({ message: 'Pen not found' })
      return
    }
    const pen = await Pen.findById(String(req.params.id))
    if (!pen) {
      res.status(404).json({ message: 'Pen not found' })
      return
    }
    if (String(pen.owner) !== req.user!.id) {
      res.status(403).json({ message: 'Not your pen' })
      return
    }
    await pen.deleteOne()
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
}

// Persist only a pen's visibility. Kept separate from updatePen so the editor
// can flip public/private immediately (keeping share links truthful) without
// having to save the whole document.
export async function setVisibility(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!Types.ObjectId.isValid(String(req.params.id))) {
      res.status(404).json({ message: 'Pen not found' })
      return
    }
    const pen = await Pen.findById(String(req.params.id))
    if (!pen) {
      res.status(404).json({ message: 'Pen not found' })
      return
    }
    if (String(pen.owner) !== req.user!.id) {
      res.status(403).json({ message: 'Not your pen' })
      return
    }
    pen.isPublic = (req.body as { isPublic?: unknown })?.isPublic === true
    await pen.save()
    res.json({ isPublic: pen.isPublic })
  } catch (error) {
    next(error)
  }
}
