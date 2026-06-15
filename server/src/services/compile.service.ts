import { compileHtml } from '../compilers/html.compiler'
import { compileCss } from '../compilers/css.compiler'
import { compileJs } from '../compilers/js.compiler'
import type { CompileRequest, CompileResponse } from '../types/compile.types'

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

export async function compileAll(
  source: Pick<CompileRequest, 'html' | 'css' | 'js'>,
  settings: CompileRequest['settings'],
): Promise<CompileResponse> {
  const errors: string[] = []
  let { html, css, js } = source

  try {
    html = await compileHtml(html, settings.htmlPreprocessor)
  } catch (e) {
    errors.push(`HTML: ${getErrorMessage(e)}`)
  }

  try {
    css = await compileCss(css, settings.cssPreprocessor)
  } catch (e) {
    errors.push(`CSS: ${getErrorMessage(e)}`)
  }

  try {
    js = compileJs(js, settings.jsPreprocessor)
  } catch (e) {
    errors.push(`JS: ${getErrorMessage(e)}`)
  }

  return { html, css, js, errors }
}
