import { Schema, model, Types, type InferSchemaType } from 'mongoose'

const likeSchema = new Schema(
  {
    pen: { type: Types.ObjectId, ref: 'Pen', required: true, index: true },
    user: { type: Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
)

likeSchema.index({ pen: 1, user: 1 }, { unique: true })

export type LikeDoc = InferSchemaType<typeof likeSchema>

export const Like = model('Like', likeSchema)
