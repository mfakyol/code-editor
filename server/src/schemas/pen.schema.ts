import { z } from 'zod'

const MAX_SOURCE = 100_000

const penSettingsSchema = z
  .object({
    htmlPreprocessor: z.enum(['none', 'pug', 'markdown', 'haml']).default('none'),
    cssPreprocessor: z.enum(['none', 'sass', 'scss', 'less', 'stylus']).default('none'),
    jsPreprocessor: z.enum(['none', 'typescript', 'coffeescript', 'babel']).default('none'),
    externalScripts: z.array(z.string()).default([]),
    externalStyles: z.array(z.string()).default([]),
  })
  .prefault({})

export const penSchema = z.object({
  title: z
    .string()
    .trim()
    .max(200, 'Title is too long')
    .optional()
    .transform((value) => (value && value.length > 0 ? value : 'Untitled Pen')),
  isPublic: z.boolean().default(false),
  html: z.string().max(MAX_SOURCE, 'Source is too large').default(''),
  css: z.string().max(MAX_SOURCE, 'Source is too large').default(''),
  js: z.string().max(MAX_SOURCE, 'Source is too large').default(''),
  settings: penSettingsSchema,
})

export const visibilitySchema = z.object({
  isPublic: z.boolean(),
})
