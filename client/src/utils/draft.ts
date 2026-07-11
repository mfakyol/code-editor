import type { PenSettings } from '@/types/preprocessors'

export type Draft = {
  title: string
  html: string
  css: string
  js: string
  settings: PenSettings
}

const DRAFT_KEY = 'codeeditor:draft'

export function loadDraft(): Draft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? (JSON.parse(raw) as Draft) : null
  } catch {
    return null
  }
}

export function saveDraft(draft: Draft): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  } catch {}
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch {}
}
