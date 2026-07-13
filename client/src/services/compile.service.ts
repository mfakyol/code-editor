import type { PenSettings } from '@/types/preprocessors'
import { api } from '@/utils/api'
import { buildErrorDoc } from '@/utils/buildErrorDoc'
import { buildSrcDoc } from '@/utils/buildSrcDoc'

export type CompileResult = {
  html: string
  css: string
  js: string
  errors: string[]
}

export type CompileSource = { html: string; css: string; js: string; settings: PenSettings }

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

export async function compileToSrcDoc({ html, css, js, settings }: CompileSource): Promise<string> {
  const compiled = await compileAll({ html, css, js }, settings)
  if (compiled.errors.length > 0) {
    return buildErrorDoc(compiled.errors)
  }
  return buildSrcDoc(compiled.html, compiled.css, compiled.js, {
    externalScripts: settings.externalScripts,
    externalStyles: settings.externalStyles,
  })
}

const compileService = {
  compileAll,
}

export default compileService
