import { describe, it, expect, beforeEach } from 'vitest'
import { loadDraft, saveDraft, clearDraft, type Draft } from './draft'
import { defaultPenSettings } from '@/types/preprocessors'

const sample: Draft = {
  title: 'Draft Pen',
  html: '<p>x</p>',
  css: 'p{}',
  js: 'x',
  settings: defaultPenSettings,
}

describe('draft persistence', () => {
  beforeEach(() => localStorage.clear())

  it('returns null when no draft is stored', () => {
    expect(loadDraft()).toBeNull()
  })

  it('round-trips a saved draft', () => {
    saveDraft(sample)
    expect(loadDraft()).toEqual(sample)
  })

  it('clears a stored draft', () => {
    saveDraft(sample)
    clearDraft()
    expect(loadDraft()).toBeNull()
  })

  it('returns null for corrupt JSON instead of throwing', () => {
    localStorage.setItem('codeeditor:draft', '{not json')
    expect(loadDraft()).toBeNull()
  })
})
