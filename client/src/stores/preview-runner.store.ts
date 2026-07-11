import { create } from 'zustand'

type RunOptions = {
  force?: boolean
}

type PreviewRunner = (options?: RunOptions) => void

type PreviewRunnerState = {
  runner: PreviewRunner | null
  registerRunner: (runner: PreviewRunner) => void
  run: PreviewRunner
}

export const usePreviewRunner = create<PreviewRunnerState>((set, get) => ({
  runner: null,
  registerRunner: (runner) => set({ runner }),
  run: (options) => get().runner?.(options),
}))
