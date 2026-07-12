import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Group, Panel, Separator } from 'react-resizable-panels'
import EditorPanel from '@/components/EditorPanel'
import EditorTabs from '@/components/EditorTabs'
import PenSettingsModal from '@/components/PenSettingsModal'
import Preview from '@/components/Preview'
import ResizeHandle from '@/components/ResizeHandle'
import { usePenSettings } from '@/stores/pen-settings.store'
import { useWorkspaceStore } from '@/stores/workspace.store'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { usePreview } from '@/hooks/usePreview'
import penService from '@/services/pen.service'
import { notify } from '@/stores/notification.store'
import { formatCode } from '@/utils/formatCode'
import { loadDraft, saveDraft } from '@/utils/draft'
import { getEditorMode, getPanelLabel, type SettingsTab } from '@/types/preprocessors'

const defaultHtml = `<div class="container">
  <h1>Hello World</h1>
  <p>Edit HTML, CSS and JS to see live output.</p>
</div>`

const defaultCss = `body {
  font-family: system-ui, sans-serif;
  padding: 1.5rem;
  background: #0f172a;
  color: #e2e8f0;
}

.container h1 {
  color: #818cf8;
  margin-bottom: 0.5rem;
}`

const defaultJs = `console.log('Hello from JS');
document.querySelector('p')?.addEventListener('click', () => {
  console.warn('Paragraph clicked!');
});`

function EditorContent() {
  const isMobile = useIsMobile()
  const { settings, updateSettings, openSettings } = usePenSettings()
  const {
    title,
    setTitle,
    setPenId,
    setIsPublic,
    setIsOwner,
    setSocial,
    registerSource,
    registerFormatter,
    viewMode,
    savedTick,
    autoRun,
  } = useWorkspaceStore()
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<SettingsTab>('html')
  const [html, setHtml] = useState(defaultHtml)
  const [css, setCss] = useState(defaultCss)
  const [js, setJs] = useState(defaultJs)

  const { srcDoc, logs, reloadNonce, clearLogs, pushLog } = usePreview({
    html,
    css,
    js,
    settings,
    autoRun,
  })

  const currentFp = JSON.stringify({ title, html, css, js, settings })
  const currentFpRef = useRef(currentFp)
  currentFpRef.current = currentFp
  const baselineFpRef = useRef(currentFp)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    setDirty(currentFp !== baselineFpRef.current)
  }, [currentFp])

  const restoredRef = useRef(false)
  useEffect(() => {
    if (restoredRef.current) return
    restoredRef.current = true
    if (id) return
    const draft = loadDraft()
    if (draft) {
      setHtml(draft.html)
      setCss(draft.css)
      setJs(draft.js)
      updateSettings(draft.settings)
      setTitle(draft.title)
      baselineFpRef.current = JSON.stringify({
        title: draft.title,
        html: draft.html,
        css: draft.css,
        js: draft.js,
        settings: draft.settings,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (id) return
    const timeout = window.setTimeout(() => {
      saveDraft({ title, html, css, js, settings })
    }, 500)
    return () => window.clearTimeout(timeout)
  }, [id, title, html, css, js, settings])

  useEffect(() => {
    if (savedTick === 0) return
    baselineFpRef.current = currentFpRef.current
    setDirty(false)
  }, [savedTick])

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  useEffect(() => {
    registerSource(() => ({ html, css, js, settings }))
  }, [html, css, js, settings, registerSource])

  useEffect(() => {
    registerFormatter(async () => {
      const [fHtml, fCss, fJs] = await Promise.all([
        formatCode(html, 'html', settings).catch(() => html),
        formatCode(css, 'css', settings).catch(() => css),
        formatCode(js, 'javascript', settings).catch(() => js),
      ])
      setHtml(fHtml)
      setCss(fCss)
      setJs(fJs)
    })
  }, [html, css, js, settings, registerFormatter])

  useEffect(() => {
    if (!id) {
      setPenId(null)
      setIsPublic(false)
      setIsOwner(true)
      setSocial({ likeCount: 0, likedByMe: false, commentCount: 0 })
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
      setHtml(pen.html)
      setCss(pen.css)
      setJs(pen.js)
      updateSettings(pen.settings)
      setTitle(pen.title)
      setPenId(pen._id)
      setIsPublic(pen.isPublic)
      setIsOwner(isOwner)
      setSocial({ likeCount, likedByMe, commentCount })
      baselineFpRef.current = JSON.stringify({
        title: pen.title,
        html: pen.html,
        css: pen.css,
        js: pen.js,
        settings: pen.settings,
      })
    })
    return () => {
      active = false
    }
  }, [id, navigate, setHtml, setCss, setJs, updateSettings, setTitle, setPenId, setIsPublic, setIsOwner, setSocial])

  const panelProps = {
    html: {
      label: getPanelLabel('html', settings),
      labelColor: 'text-orange-400',
      value: html,
      mode: getEditorMode('html', settings),
      onChange: setHtml,
      onSettingsClick: () => openSettings('html'),
    },
    css: {
      label: getPanelLabel('css', settings),
      labelColor: 'text-sky-400',
      value: css,
      mode: getEditorMode('css', settings),
      onChange: setCss,
      onSettingsClick: () => openSettings('css'),
    },
    js: {
      label: getPanelLabel('javascript', settings),
      labelColor: 'text-yellow-400',
      value: js,
      mode: getEditorMode('javascript', settings),
      onChange: setJs,
      onSettingsClick: () => openSettings('javascript'),
    },
  }

  const renderEditors = (orientation: 'horizontal' | 'vertical') => {
    const sepClass = orientation === 'horizontal' ? 'resize-separator-vertical' : 'resize-separator-horizontal'
    const handleDir = orientation === 'horizontal' ? 'vertical' : 'horizontal'

    return (
      <Group orientation={orientation} className="h-full">
        <Panel defaultSize={33.33} minSize={15}>
          <EditorPanel {...panelProps.html} />
        </Panel>

        <Separator className={`resize-separator ${sepClass}`}>
          <ResizeHandle direction={handleDir} />
        </Separator>

        <Panel defaultSize={33.33} minSize={15}>
          <EditorPanel {...panelProps.css} />
        </Panel>

        <Separator className={`resize-separator ${sepClass}`}>
          <ResizeHandle direction={handleDir} />
        </Separator>

        <Panel defaultSize={33.34} minSize={15}>
          <EditorPanel {...panelProps.js} />
        </Panel>
      </Group>
    )
  }

  const previewPanel = (
    <Panel defaultSize={50} minSize={20}>
      <Preview srcDoc={srcDoc} logs={logs} reloadNonce={reloadNonce} clearLogs={clearLogs} pushLog={pushLog} />
    </Panel>
  )

  const renderDesktop = () => {
    if (viewMode === 'top') {
      return (
        <Group key="top" orientation="vertical" className="h-full">
          <Panel defaultSize={50} minSize={20}>
            {renderEditors('horizontal')}
          </Panel>
          <Separator className="resize-separator resize-separator-horizontal">
            <ResizeHandle direction="horizontal" />
          </Separator>
          {previewPanel}
        </Group>
      )
    }

    const editorsPanel = (
      <Panel defaultSize={50} minSize={20}>
        {renderEditors('vertical')}
      </Panel>
    )

    return (
      <Group key={viewMode} orientation="horizontal" className="h-full">
        {viewMode === 'left' ? editorsPanel : previewPanel}
        <Separator className="resize-separator resize-separator-vertical">
          <ResizeHandle direction="vertical" />
        </Separator>
        {viewMode === 'left' ? previewPanel : editorsPanel}
      </Group>
    )
  }

  return (
    <>
      {isMobile ? (
        <Group orientation="vertical" className="h-full">
          <Panel defaultSize={55} minSize={30}>
            <div className="flex h-full min-h-0 flex-col">
              <EditorTabs active={activeTab} onChange={setActiveTab} onSettingsClick={() => openSettings(activeTab)} />
              <div className="min-h-0 flex-1">
                {activeTab === 'html' && <EditorPanel {...panelProps.html} showLabel={false} />}
                {activeTab === 'css' && <EditorPanel {...panelProps.css} showLabel={false} />}
                {activeTab === 'javascript' && <EditorPanel {...panelProps.js} showLabel={false} />}
              </div>
            </div>
          </Panel>

          <Separator className="resize-separator resize-separator-horizontal">
            <ResizeHandle direction="horizontal" />
          </Separator>

          <Panel defaultSize={45} minSize={25}>
            <Preview srcDoc={srcDoc} logs={logs} reloadNonce={reloadNonce} clearLogs={clearLogs} pushLog={pushLog} />
          </Panel>
        </Group>
      ) : (
        renderDesktop()
      )}

      <PenSettingsModal />
    </>
  )
}

function Editor() {
  return <EditorContent />
}

export default Editor
