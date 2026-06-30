import vm from 'node:vm'
import pug from 'pug'
import { marked } from 'marked'
import haml from 'haml'
import type { HtmlPreprocessor } from '../types/preprocessors'

// Pug templates can contain arbitrary JS that runs at render time. Calling
// the compiled function directly would execute it with full Node privileges
// (process/require → RCE). Instead we render the template inside a locked-down
// vm context with no Node globals and a hard timeout.
function renderPugSafely(code: string): string {
  const clientCode = pug.compileClient(code, { compileDebug: false })
  const sandbox = Object.create(null) as { __out?: string }
  vm.runInNewContext(`${clientCode}\nthis.__out = template({});`, sandbox, {
    timeout: 2000,
  })
  return sandbox.__out ?? ''
}

export async function compileHtml(
  code: string,
  preprocessor: HtmlPreprocessor,
): Promise<string> {
  switch (preprocessor) {
    case 'pug':
      return renderPugSafely(code)
    case 'markdown':
      return marked.parse(code) as string
    case 'haml':
      return haml.render(code)
    case 'none':
    default:
      return code
  }
}
