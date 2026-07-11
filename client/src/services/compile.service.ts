import type { PenSettings } from '@/types/preprocessors'
import { API_BASE } from '@/utils/api'

const COMPILE_URL = `${API_BASE}/api/compile`

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

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

async function compileAll(
  source: { html: string; css: string; js: string },
  settings: PenSettings,
): Promise<CompileResult> {
  if (!needsServerCompilation(settings)) {
    return { ...source, errors: [] }
  }

  try {
    const res = await fetch(COMPILE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...source, settings }),
    })

    const body: unknown = await res.json().catch(() => null)

    if (!res.ok) {
      const errorBody = body as { message?: string; errors?: string[] } | null
      const errors = Array.isArray(errorBody?.errors)
        ? errorBody.errors
        : [`Server error (${res.status}): ${errorBody?.message ?? res.statusText}`]

      return { ...source, errors }
    }

    return body as CompileResult
  } catch (error) {
    return {
      ...source,
      errors: [`Network: ${toErrorMessage(error)}`],
    }
  }
}

const compileService = {
  compileAll,
}

export default compileService
