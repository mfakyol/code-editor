import type { PenSettings } from './preprocessors'

export type CompileRequest = {
  html: string
  css: string
  js: string
  settings: PenSettings
}

export type CompileResponse = {
  html: string
  css: string
  js: string
  errors: string[]
}
