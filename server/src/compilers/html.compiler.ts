import pug from 'pug'
import { marked } from 'marked'
import type { HtmlPreprocessor } from '../types/preprocessors'

export async function compileHtml(
  code: string,
  preprocessor: HtmlPreprocessor,
): Promise<string> {
  switch (preprocessor) {
    case 'pug':
      return pug.compile(code, { compileDebug: false })()
    case 'markdown':
      return marked.parse(code) as string
    case 'none':
    default:
      return code
  }
}
