import type { Request, Response, NextFunction } from 'express'
import { Types } from 'mongoose'
import { User } from '../models/User'
import { Pen } from '../models/Pen'
import { AppError } from '../errors/AppError'

export async function getUserProfile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const username = String(req.params.username)
    const user = await User.findOne({ username }).select('username').lean()
    if (!user) {
      throw new AppError(404, 'User not found', 'USER_NOT_FOUND')
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
