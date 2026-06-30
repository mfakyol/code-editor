import ts from 'typescript'
import coffee from 'coffeescript'
import { transformSync } from '@babel/core'
import presetReact from '@babel/preset-react'
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
    case 'babel':
      // JSX → React.createElement (classic runtime); React must be added as
      // an external script by the user.
      try {
        return (
          transformSync(code, {
            presets: [[presetReact, { runtime: 'classic' }]],
            filename: 'pen.jsx',
            babelrc: false,
            configFile: false,
          })?.code ?? code
        )
      } catch (error) {
        // Babel prefixes messages with the absolute file path — strip it.
        const message =
          error instanceof Error ? error.message : String(error)
        throw new Error(message.replace(/^.*pen\.jsx:\s*/, ''))
      }
    case 'coffeescript':
      try {
        return coffee.compile(code, { bare: true })
      } catch (error) {
        // CoffeeScript SyntaxError.toString() yields a code frame
        // (line:col, source line, caret) that .message alone omits.
        throw new Error(String(error))
      }
    case 'none':
    default:
      return code
  }
}
