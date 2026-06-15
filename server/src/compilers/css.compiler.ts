import sass from 'sass'
import less from 'less'
import type { CssPreprocessor } from '../types/preprocessors'

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
      return (await less.render(code)).css
    case 'none':
    default:
      return code
  }
}
