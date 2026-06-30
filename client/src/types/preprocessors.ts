export type HtmlPreprocessor = 'none' | 'pug' | 'markdown' | 'haml'
export type CssPreprocessor = 'none' | 'sass' | 'scss' | 'less' | 'stylus'
export type JsPreprocessor =
  | 'none'
  | 'typescript'
  | 'coffeescript'
  | 'babel'
export type SettingsTab = 'html' | 'css' | 'javascript'

export type PenSettings = {
  htmlPreprocessor: HtmlPreprocessor
  cssPreprocessor: CssPreprocessor
  jsPreprocessor: JsPreprocessor
  externalScripts: string[]
  externalStyles: string[]
}

export const defaultPenSettings: PenSettings = {
  htmlPreprocessor: 'none',
  cssPreprocessor: 'none',
  jsPreprocessor: 'none',
  externalScripts: [],
  externalStyles: [],
}

import type { EditorMode } from '@/types/editor'

export function getEditorMode(tab: SettingsTab, settings: PenSettings): EditorMode {
  if (tab === 'html') {
    if (settings.htmlPreprocessor === 'markdown') return 'markdown'
    return 'html'
  }

  if (tab === 'css') {
    if (settings.cssPreprocessor === 'scss') return 'scss'
    if (settings.cssPreprocessor === 'sass') return 'scss'
    if (settings.cssPreprocessor === 'less') return 'less'
    if (settings.cssPreprocessor === 'stylus') return 'stylus'
    return 'css'
  }

  if (settings.jsPreprocessor === 'typescript') return 'typescript'
  if (settings.jsPreprocessor === 'coffeescript') return 'coffeescript'
  if (settings.jsPreprocessor === 'babel') return 'jsx'
  return 'javascript'
}

export function getPanelLabel(tab: SettingsTab, settings: PenSettings): string {
  if (tab === 'html') {
    if (settings.htmlPreprocessor === 'pug') return 'HTML (Pug)'
    if (settings.htmlPreprocessor === 'markdown') return 'HTML (Markdown)'
    if (settings.htmlPreprocessor === 'haml') return 'HTML (Haml)'
    return 'HTML'
  }

  if (tab === 'css') {
    if (settings.cssPreprocessor === 'sass') return 'CSS (Sass)'
    if (settings.cssPreprocessor === 'scss') return 'CSS (SCSS)'
    if (settings.cssPreprocessor === 'less') return 'CSS (Less)'
    if (settings.cssPreprocessor === 'stylus') return 'CSS (Stylus)'
    return 'CSS'
  }

  if (settings.jsPreprocessor === 'typescript') return 'JS (TypeScript)'
  if (settings.jsPreprocessor === 'coffeescript') return 'JS (CoffeeScript)'
  if (settings.jsPreprocessor === 'babel') return 'JS (Babel/JSX)'
  return 'JS'
}
