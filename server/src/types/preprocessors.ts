export type HtmlPreprocessor = 'none' | 'pug' | 'markdown'
export type CssPreprocessor = 'none' | 'sass' | 'scss' | 'less'
export type JsPreprocessor = 'none' | 'typescript'

export type PenSettings = {
  htmlPreprocessor: HtmlPreprocessor
  cssPreprocessor: CssPreprocessor
  jsPreprocessor: JsPreprocessor
}
