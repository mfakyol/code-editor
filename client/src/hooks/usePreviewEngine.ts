import { useEffect } from 'react'
import { useWorkspaceStore } from '@/stores/workspace.store'
import { usePenSettings } from '@/stores/pen-settings.store'
import { usePreferences } from '@/stores/preferences.store'
import { usePreviewStore } from '@/stores/preview.store'

export function usePreviewEngine(enabled: boolean) {
  const html = useWorkspaceStore((s) => s.html)
  const css = useWorkspaceStore((s) => s.css)
  const js = useWorkspaceStore((s) => s.js)
  const autoRun = usePreferences((s) => s.autoRun)
  const settings = usePenSettings((s) => s.settings)

  useEffect(() => {
    if (!enabled || !autoRun) return
    const timeout = window.setTimeout(() => usePreviewStore.getState().run(), 400)
    return () => window.clearTimeout(timeout)
  }, [enabled, html, css, js, settings, autoRun])

  useEffect(() => () => usePreviewStore.getState().reset(), [])
}
