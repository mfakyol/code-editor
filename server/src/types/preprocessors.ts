export type HtmlPreprocessor = 'none' | 'pug' | 'markdown' | 'haml'
export type CssPreprocessor = 'none' | 'sass' | 'scss' | 'less' | 'stylus'
export type JsPreprocessor =
  | 'none'
  | 'typescript'
  | 'coffeescript'
  | 'babel'

export type PenSettings = {
  htmlPreprocessor: HtmlPreprocessor
  cssPreprocessor: CssPreprocessor
  jsPreprocessor: JsPreprocessor
}
