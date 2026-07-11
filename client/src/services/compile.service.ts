import type { PenSettings } from '@/types/preprocessors'
import { api } from '@/utils/api'

export type CompileResult = {
  html: string
  css: string
  js: string
  errors: string[]
}

function needsServerCompilation(settings: PenSettings): boolean {
  return (
    settings.htmlPreprocessor !== 'none' || settings.cssPreprocessor !== 'none' || settings.jsPreprocessor !== 'none'
  )
}

async function compileAll(
  source: { html: string; css: string; js: string },
  settings: PenSettings,
): Promise<CompileResult> {
  if (!needsServerCompilation(settings)) {
    return { ...source, errors: [] }
  }

  const res = await api.post<CompileResult>('/compile', { ...source, settings })

  if (res.success) {
    return res.data
  }

  return { ...source, errors: res.error.errors.length > 0 ? res.error.errors : [res.error.message] }
}

const compileService = {
  compileAll,
}

export default compileService
