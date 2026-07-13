import { z } from 'zod'

const MAX_SOURCE = 100_000

export const compileSchema = z.object({
  html: z.string().max(MAX_SOURCE, 'Source is too large'),
  css: z.string().max(MAX_SOURCE, 'Source is too large'),
  js: z.string().max(MAX_SOURCE, 'Source is too large'),
  settings: z
    .object({
      htmlPreprocessor: z.enum(['none', 'pug', 'markdown', 'haml']),
      cssPreprocessor: z.enum(['none', 'sass', 'scss', 'less', 'stylus']),
      jsPreprocessor: z.enum(['none', 'typescript', 'coffeescript', 'babel']),
    })
    .loose(),
})
