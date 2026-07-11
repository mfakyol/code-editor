import type { Request, Response, NextFunction } from 'express'
import type { CompileRequest } from '../types/compile.types'
import { AppError } from '../errors/AppError'
import type {
  CssPreprocessor,
  HtmlPreprocessor,
  JsPreprocessor,
} from '../types/preprocessors'

const HTML_PREPROCESSORS: HtmlPreprocessor[] = ['none', 'pug', 'markdown', 'haml']
const CSS_PREPROCESSORS: CssPreprocessor[] = ['none', 'sass', 'scss', 'less', 'stylus']
const JS_PREPROCESSORS: JsPreprocessor[] = [
  'none',
  'typescript',
  'coffeescript',
  'babel',
]

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

export function validateCompileBody(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const body = req.body as Partial<CompileRequest>
  const errors: string[] = []

  if (!isString(body.html)) {
    errors.push('html must be a string')
  }
  if (!isString(body.css)) {
    errors.push('css must be a string')
  }
  if (!isString(body.js)) {
    errors.push('js must be a string')
  }

  if (!body.settings || typeof body.settings !== 'object') {
    errors.push('settings is required')
  } else {
    const { settings } = body

    if (!HTML_PREPROCESSORS.includes(settings.htmlPreprocessor)) {
      errors.push(
        `settings.htmlPreprocessor must be one of: ${HTML_PREPROCESSORS.join(', ')}`,
      )
    }
    if (!CSS_PREPROCESSORS.includes(settings.cssPreprocessor)) {
      errors.push(
        `settings.cssPreprocessor must be one of: ${CSS_PREPROCESSORS.join(', ')}`,
      )
    }
    if (!JS_PREPROCESSORS.includes(settings.jsPreprocessor)) {
      errors.push(
        `settings.jsPreprocessor must be one of: ${JS_PREPROCESSORS.join(', ')}`,
      )
    }
  }

  if (errors.length > 0) {
    throw new AppError(400, 'Invalid request body', 'VALIDATION', errors)
  }

  next()
}
