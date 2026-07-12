import { create } from 'zustand'
import type { PenSettings } from '@/types/preprocessors'

export type PenSource = {
  html: string
  css: string
  js: string
  settings: PenSettings
}

export type ViewMode = 'top' | 'left' | 'right'

export type EditorTheme = 'dracula' | 'githubDark' | 'githubLight'

type SourceGetter = () => PenSource
type Formatter = () => Promise<void>

type WorkspaceState = {
  title: string
  setTitle: (title: string) => void
  penId: string | null
  setPenId: (id: string | null) => void
  isPublic: boolean
  setIsPublic: (value: boolean) => void
  isOwner: boolean
  setIsOwner: (value: boolean) => void
  likeCount: number
  likedByMe: boolean
  commentCount: number
  setSocial: (state: { likeCount: number; likedByMe: boolean; commentCount: number }) => void
  sourceGetter: SourceGetter | null
  registerSource: (getter: SourceGetter) => void
  getSource: () => PenSource | null
  formatter: Formatter | null
  registerFormatter: (formatter: Formatter) => void
  format: () => Promise<void>
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  savedTick: number
  markSaved: () => void
  fontSize: number
  adjustFontSize: (delta: number) => void
  autoRun: boolean
  setAutoRun: (value: boolean) => void
  editorTheme: EditorTheme
  setEditorTheme: (theme: EditorTheme) => void
}

const EDITOR_THEMES: EditorTheme[] = ['dracula', 'githubDark', 'githubLight']

export const MIN_FONT_SIZE = 10
export const MAX_FONT_SIZE = 28

function readStored<T>(key: string, fallback: T, parse: (raw: string) => T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : parse(raw)
  } catch {
    return fallback
  }
}

function persist(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {}
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  title: 'Untitled Pen',
  setTitle: (title) => set({ title }),
  penId: null,
  setPenId: (penId) => set({ penId }),

  isPublic: false,
  setIsPublic: (isPublic) => set({ isPublic }),
  isOwner: true,
  setIsOwner: (isOwner) => set({ isOwner }),
  likeCount: 0,
  likedByMe: false,
  commentCount: 0,
  setSocial: ({ likeCount, likedByMe, commentCount }) => set({ likeCount, likedByMe, commentCount }),
  sourceGetter: null,
  registerSource: (getter) => set({ sourceGetter: getter }),
  getSource: () => get().sourceGetter?.() ?? null,
  formatter: null,
  registerFormatter: (formatter) => set({ formatter }),
  format: async () => {
    await get().formatter?.()
  },
  viewMode: readStored<ViewMode>('codeeditor:viewMode', 'top', (raw) =>
    raw === 'left' || raw === 'right' ? raw : 'top',
  ),
  setViewMode: (mode) => {
    set({ viewMode: mode })
    persist('codeeditor:viewMode', mode)
  },
  savedTick: 0,
  markSaved: () => set((state) => ({ savedTick: state.savedTick + 1 })),
  fontSize: readStored('codeeditor:fontSize', 14, (raw) => {
    const n = Number(raw)
    return n >= MIN_FONT_SIZE && n <= MAX_FONT_SIZE ? n : 14
  }),
  adjustFontSize: (delta) => {
    const clamped = Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, get().fontSize + delta))
    set({ fontSize: clamped })
    persist('codeeditor:fontSize', String(clamped))
  },
  autoRun: readStored('codeeditor:autoRun', true, (raw) => raw !== 'false'),
  setAutoRun: (value) => {
    set({ autoRun: value })
    persist('codeeditor:autoRun', String(value))
  },
  editorTheme: readStored<EditorTheme>('codeeditor:editorTheme', 'dracula', (raw) =>
    EDITOR_THEMES.includes(raw as EditorTheme) ? (raw as EditorTheme) : 'dracula',
  ),
  setEditorTheme: (theme) => {
    set({ editorTheme: theme })
    persist('codeeditor:editorTheme', theme)
  },
}))
