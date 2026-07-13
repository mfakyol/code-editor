import { create } from 'zustand'
import { compileToSrcDoc } from '@/services/compile.service'
import { useWorkspaceStore } from '@/stores/workspace.store'
import { usePenSettings } from '@/stores/pen-settings.store'

export type ConsoleLog = {
  id: number
  level: 'log' | 'warn' | 'error'
  message: string
}

type RunOptions = { force?: boolean }

type PreviewState = {
  srcDoc: string
  logs: ConsoleLog[]
  reloadNonce: number
  lastFingerprint: string | null
  nextLogId: number
  run: (options?: RunOptions) => Promise<void>
  clearLogs: () => void
  pushLog: (level: ConsoleLog['level'], message: string) => void
  reset: () => void
}

function fingerprint(html: string, css: string, js: string, settings: unknown): string {
  return JSON.stringify({ html, css, js, settings })
}

export const usePreviewStore = create<PreviewState>((set, get) => ({
  srcDoc: '',
  logs: [],
  reloadNonce: 0,
  lastFingerprint: null,
  nextLogId: 0,

  clearLogs: () => set({ logs: [], nextLogId: 0 }),

  reset: () => set({ srcDoc: '', logs: [], reloadNonce: 0, lastFingerprint: null, nextLogId: 0 }),

  pushLog: (level, message) =>
    set((s) => ({ logs: [...s.logs, { id: s.nextLogId, level, message }], nextLogId: s.nextLogId + 1 })),

  run: async (options) => {
    const { html, css, js } = useWorkspaceStore.getState()
    const { settings } = usePenSettings.getState()
    const fp = fingerprint(html, css, js, settings)
    const force = options?.force ?? false

    if (!force && fp === get().lastFingerprint) return

    if (force && fp === get().lastFingerprint) {
      set((s) => ({ logs: [], nextLogId: 0, reloadNonce: s.reloadNonce + 1 }))
      return
    }

    const srcDoc = await compileToSrcDoc({ html, css, js, settings })

    set((s) => ({ srcDoc, logs: [], nextLogId: 0, lastFingerprint: fp, reloadNonce: s.reloadNonce + 1 }))
  },
}))
