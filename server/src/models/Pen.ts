import { Schema, model, Types, type InferSchemaType } from 'mongoose'

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

export type PenDoc = InferSchemaType<typeof penSchema>

export const Pen = model('Pen', penSchema)
