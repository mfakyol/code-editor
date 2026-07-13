import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import EditorWorkspace from '@/components/editor/EditorWorkspace'
import PenSettingsModal from '@/components/PenSettingsModal'
import { usePenSettings } from '@/stores/pen-settings.store'
import { useWorkspaceStore, DEFAULT_HTML, DEFAULT_CSS, DEFAULT_JS, DEFAULT_TITLE } from '@/stores/workspace.store'
import { usePreferences } from '@/stores/preferences.store'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { usePreviewEngine } from '@/hooks/usePreviewEngine'
import penService from '@/services/pen.service'
import { notify } from '@/stores/notification.store'
import { loadDraft, saveDraft } from '@/utils/draft'
import { defaultPenSettings, getEditorMode, getPanelLabel, type SettingsTab } from '@/types/preprocessors'

function Editor() {
  const isMobile = useIsMobile()
  const { settings, updateSettings, openSettings } = usePenSettings()
  const title = useWorkspaceStore((s) => s.title)
  const html = useWorkspaceStore((s) => s.html)
  const css = useWorkspaceStore((s) => s.css)
  const js = useWorkspaceStore((s) => s.js)
  const setHtml = useWorkspaceStore((s) => s.setHtml)
  const setCss = useWorkspaceStore((s) => s.setCss)
  const setJs = useWorkspaceStore((s) => s.setJs)
  const dirty = useWorkspaceStore((s) => s.dirty)
  const loadedKey = useWorkspaceStore((s) => s.loadedKey)
  const viewMode = usePreferences((s) => s.viewMode)

  const { id } = useParams()
  const routeKey = id ?? 'new'
  const ready = loadedKey === routeKey
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<SettingsTab>('html')

  usePreviewEngine(ready)

  useEffect(
    () =>
      usePenSettings.subscribe((s, p) => s.settings !== p.settings && useWorkspaceStore.getState().recomputeDirty()),
    [],
  )

  useEffect(() => {
    const ws = useWorkspaceStore.getState()

    if (!id) {
      ws.setPenId(null)
      ws.setIsPublic(false)
      ws.setIsOwner(true)
      ws.setSocial({ likeCount: 0, likedByMe: false, commentCount: 0 })
      const draft = loadDraft()
      ws.setCode(
        draft
          ? { html: draft.html, css: draft.css, js: draft.js }
          : { html: DEFAULT_HTML, css: DEFAULT_CSS, js: DEFAULT_JS },
      )
      updateSettings(draft?.settings ?? defaultPenSettings)
      ws.setTitle(draft?.title ?? DEFAULT_TITLE)
      ws.markSaved()
      ws.setLoadedKey('new')
      return
    }

    let active = true
    penService.get(id).then((res) => {
      if (!active) return
      if (!res.success) {
        notify.error(res.error.message)
        navigate('/pen', { replace: true })
        return
      }
      const { pen, isOwner, likeCount, commentCount, likedByMe } = res.data
      ws.setCode({ html: pen.html, css: pen.css, js: pen.js })
      updateSettings(pen.settings)
      ws.setTitle(pen.title)
      ws.setPenId(pen._id)
      ws.setIsPublic(pen.isPublic)
      ws.setIsOwner(isOwner)
      ws.setSocial({ likeCount, likedByMe, commentCount })
      ws.markSaved()
      ws.setLoadedKey(id)
    })
    return () => {
      active = false
    }
  }, [id, navigate, updateSettings])

  useEffect(() => {
    if (id) return
    const timeout = window.setTimeout(() => saveDraft({ title, html, css, js, settings }), 500)
    return () => window.clearTimeout(timeout)
  }, [id, title, html, css, js, settings])

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  const panelProps = {
    html: {
      label: getPanelLabel('html', settings),
      labelColor: 'text-orange-400',
      value: html,
      mode: getEditorMode('html', settings),
      settingsTab: 'html' as const,
      onChange: setHtml,
      onOpenSettings: openSettings,
    },
    css: {
      label: getPanelLabel('css', settings),
      labelColor: 'text-sky-400',
      value: css,
      mode: getEditorMode('css', settings),
      settingsTab: 'css' as const,
      onChange: setCss,
      onOpenSettings: openSettings,
    },
    js: {
      label: getPanelLabel('javascript', settings),
      labelColor: 'text-yellow-400',
      value: js,
      mode: getEditorMode('javascript', settings),
      settingsTab: 'javascript' as const,
      onChange: setJs,
      onOpenSettings: openSettings,
    },
  }

  if (!ready) {
    return <div className="h-full w-full animate-pulse bg-neutral-950" />
  }

  return (
    <>
      <EditorWorkspace
        panels={panelProps}
        viewMode={viewMode}
        isMobile={isMobile}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSettings={openSettings}
      />
      <PenSettingsModal />
    </>
  )
}

export default Editor
