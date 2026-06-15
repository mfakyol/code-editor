export type HtmlPreprocessor = 'none' | 'pug' | 'markdown'
export type CssPreprocessor = 'none' | 'sass' | 'scss' | 'less'
export type JsPreprocessor = 'none' | 'typescript'
export type SettingsTab = 'html' | 'css' | 'javascript'

export type PenSettings = {
  htmlPreprocessor: HtmlPreprocessor
  cssPreprocessor: CssPreprocessor
  jsPreprocessor: JsPreprocessor
}

export const defaultPenSettings: PenSettings = {
  htmlPreprocessor: 'none',
  cssPreprocessor: 'none',
  jsPreprocessor: 'none',
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
    return 'css'
  }

  if (settings.jsPreprocessor === 'typescript') return 'typescript'
  return 'javascript'
}

export function getPanelLabel(tab: SettingsTab, settings: PenSettings): string {
  if (tab === 'html') {
    if (settings.htmlPreprocessor === 'pug') return 'HTML (Pug)'
    if (settings.htmlPreprocessor === 'markdown') return 'HTML (Markdown)'
    return 'HTML'
  }

  if (tab === 'css') {
    if (settings.cssPreprocessor === 'sass') return 'CSS (Sass)'
    if (settings.cssPreprocessor === 'scss') return 'CSS (SCSS)'
    if (settings.cssPreprocessor === 'less') return 'CSS (Less)'
    return 'CSS'
  }

  if (settings.jsPreprocessor === 'typescript') return 'JS (TypeScript)'
  return 'JS'
}
