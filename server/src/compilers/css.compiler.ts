import sass from 'sass'
import less from 'less'
import stylus from 'stylus'
import type { CssPreprocessor } from '../types/preprocessors'

// Stylus only exposes a callback-based render, so wrap it in a promise.
function renderStylus(code: string): Promise<string> {
  return new Promise((resolve, reject) => {
    stylus.render(code, (err, css) => {
      if (err) reject(err)
      else resolve(css)
    })
  })
}

type LessError = {
  message: string
  line?: number
  column?: number
  extract?: (string | null)[]
}

// Less attaches line/column/extract to the error object instead of the
// message, so build a code frame from them (Sass/Pug already do this).
function formatLessError(error: unknown): string {
  const err = error as LessError
  let message = err.message ?? String(error)

  if (typeof err.line === 'number') {
    const column = typeof err.column === 'number' ? err.column : 0
    message += ` (${err.line}:${column})`

    const sourceLine = err.extract?.[1]
    if (typeof sourceLine === 'string') {
      const caret = `${' '.repeat(Math.max(0, column))}^`
      message += `\n${sourceLine}\n${caret}`
    }
  }

  return message
}

export async function compileCss(
  code: string,
  preprocessor: CssPreprocessor,
): Promise<string> {
  switch (preprocessor) {
    case 'sass':
      return sass.compileString(code, { syntax: 'indented' }).css
    case 'scss':
      return sass.compileString(code, { syntax: 'scss' }).css
    case 'less':
      try {
        return (await less.render(code)).css
      } catch (error) {
        throw new Error(formatLessError(error))
      }
    case 'stylus':
      return renderStylus(code)
    case 'none':
    default:
      return code
  }
}
