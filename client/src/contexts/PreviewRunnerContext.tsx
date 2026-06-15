import { createContext, useCallback, useContext, useRef, type ReactNode } from 'react'

type RunOptions = {
  force?: boolean
}

type PreviewRunner = (options?: RunOptions) => void

type PreviewRunnerContextValue = {
  registerRunner: (runner: PreviewRunner) => void
  run: PreviewRunner
}

const PreviewRunnerContext = createContext<PreviewRunnerContextValue | null>(null)

export function PreviewRunnerProvider({ children }: { children: ReactNode }) {
  const runnerRef = useRef<PreviewRunner | null>(null)

  const registerRunner = useCallback((runner: PreviewRunner) => {
    runnerRef.current = runner
  }, [])

  const run = useCallback((options?: RunOptions) => {
    runnerRef.current?.(options)
  }, [])

  return (
    <PreviewRunnerContext.Provider value={{ registerRunner, run }}>
      {children}
    </PreviewRunnerContext.Provider>
  )
}

export function usePreviewRunner() {
  const context = useContext(PreviewRunnerContext)
  if (!context) {
    throw new Error('usePreviewRunner must be used within PreviewRunnerProvider')
  }
  return context
}
