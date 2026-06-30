import type { Request, Response, NextFunction } from 'express'
import { Types } from 'mongoose'
import { User } from '../models/User'
import { Pen } from '../models/Pen'

// Public profile: a user's display name plus their public pens (with like
// counts), newest first. Private pens are never exposed here.
export async function getUserProfile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const username = String(req.params.username)
    const user = await User.findOne({ username }).select('username').lean()
    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    const pens = await Pen.aggregate([
      { $match: { owner: new Types.ObjectId(user._id), isPublic: true } },
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'pen',
          as: 'likes',
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
          ownerName: { $literal: user.username },
        },
      },
      { $sort: { updatedAt: -1 } },
      { $limit: 100 },
    ])

    res.json({ user: { username: user.username }, pens })
  } catch (error) {
    next(error)
  }
}
