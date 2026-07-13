import vm from 'node:vm'
import pug from 'pug'
import { marked } from 'marked'
import haml from 'haml'
import type { HtmlPreprocessor } from '../types/preprocessors'

const RENDER_TIMEOUT_MS = 2000

function renderPugSafely(code: string): string {
  const clientCode = pug.compileClient(code, { compileDebug: false })
  const sandbox = Object.create(null) as { __out?: string }
  vm.runInNewContext(`${clientCode}\nthis.__out = template({});`, sandbox, {
    timeout: RENDER_TIMEOUT_MS,
  })
  return sandbox.__out ?? ''
}

haml('')

const HAML_RUNTIME = `
function html_escape(text) {
  return (text + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
var _o; with ({}) { eval('_o=' + __js); } this.__out = _o;
`

function renderHamlSafely(code: string): string {
  const sandbox = Object.create(null) as { __js: string; __out?: string }
  sandbox.__js = haml.compile(code)
  vm.runInNewContext(HAML_RUNTIME, sandbox, { timeout: RENDER_TIMEOUT_MS })
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
      return renderHamlSafely(code)
    case 'none':
    default:
      return code
  }
}
