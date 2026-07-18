import { Schema, model, Types, type InferSchemaType } from 'mongoose'
import { Like } from './Like'
import { Comment } from './Comment'

const settingsSchema = new Schema(
  {
    htmlPreprocessor: { type: String, default: 'none' },
    cssPreprocessor: { type: String, default: 'none' },
    jsPreprocessor: { type: String, default: 'none' },
    externalScripts: { type: [String], default: [] },
    externalStyles: { type: [String], default: [] },
  },
  { _id: false },
)

const penSchema = new Schema(
  {
    owner: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, default: 'Untitled Pen', trim: true },
    isPublic: { type: Boolean, default: false, index: true },
    html: { type: String, default: '' },
    css: { type: String, default: '' },
    js: { type: String, default: '' },
    settings: { type: settingsSchema, default: () => ({}) },
  },
  { timestamps: true },
)

penSchema.post('deleteOne', { document: true, query: false }, async function () {
  const penId = this._id
  await Promise.all([Like.deleteMany({ pen: penId }), Comment.deleteMany({ pen: penId })])
})

export type PenDoc = InferSchemaType<typeof penSchema>

export const Pen = model('Pen', penSchema)
