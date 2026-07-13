import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ViewMode = 'top' | 'left' | 'right'
export type EditorTheme = 'dracula' | 'githubDark' | 'githubLight'

export const MIN_FONT_SIZE = 10
export const MAX_FONT_SIZE = 28

type PreferencesState = {
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  fontSize: number
  adjustFontSize: (delta: number) => void
  autoRun: boolean
  setAutoRun: (value: boolean) => void
  editorTheme: EditorTheme
  setEditorTheme: (theme: EditorTheme) => void
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set, get) => ({
      viewMode: 'top',
      setViewMode: (viewMode) => set({ viewMode }),
      fontSize: 14,
      adjustFontSize: (delta) =>
        set({ fontSize: Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, get().fontSize + delta)) }),
      autoRun: true,
      setAutoRun: (autoRun) => set({ autoRun }),
      editorTheme: 'dracula',
      setEditorTheme: (editorTheme) => set({ editorTheme }),
    }),
    { name: 'codeeditor:preferences' },
  ),
)
