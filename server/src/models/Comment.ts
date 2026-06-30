import { Schema, model, Types, type InferSchemaType } from 'mongoose'

const commentSchema = new Schema(
  {
    pen: { type: Types.ObjectId, ref: 'Pen', required: true, index: true },
    user: { type: Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true },
)

export type CommentDoc = InferSchemaType<typeof commentSchema>

export const Comment = model('Comment', commentSchema)
