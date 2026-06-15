import ts from 'typescript'
import type { JsPreprocessor } from '../types/preprocessors'

export function compileJs(code: string, preprocessor: JsPreprocessor): string {
  switch (preprocessor) {
    case 'typescript':
      return ts.transpileModule(code, {
        compilerOptions: {
          module: ts.ModuleKind.ES2015,
          target: ts.ScriptTarget.ES2015,
        },
      }).outputText
    case 'none':
    default:
      return code
  }
}
