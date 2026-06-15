import { useState } from 'react'
import { Group, Panel, Separator } from 'react-resizable-panels'
import EditorPanel from '@/components/EditorPanel'
import EditorTabs from '@/components/EditorTabs'
import PenSettingsModal from '@/components/PenSettingsModal'
import Preview from '@/components/Preview'
import ResizeHandle from '@/components/ResizeHandle'
import { PenSettingsProvider, usePenSettings } from '@/contexts/PenSettingsContext'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { usePreview } from '@/hooks/usePreview'
import {
  getEditorMode,
  getPanelLabel,
  type SettingsTab,
} from '@/types/preprocessors'

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
  const { settings, openSettings } = usePenSettings()
  const [activeTab, setActiveTab] = useState<SettingsTab>('html')
  const [html, setHtml] = useState(defaultHtml)
  const [css, setCss] = useState(defaultCss)
  const [js, setJs] = useState(defaultJs)

  const { srcDoc, logs, reloadNonce } = usePreview({ html, css, js, settings })

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

  return (
    <>
      <Group orientation="vertical" className="h-full">
        <Panel defaultSize={isMobile ? 55 : 50} minSize={isMobile ? 30 : 20}>
          {isMobile ? (
            <div className="flex h-full min-h-0 flex-col">
              <EditorTabs
                active={activeTab}
                onChange={setActiveTab}
                onSettingsClick={() => openSettings(activeTab)}
              />
              <div className="min-h-0 flex-1">
                {activeTab === 'html' && (
                  <EditorPanel {...panelProps.html} showLabel={false} />
                )}
                {activeTab === 'css' && (
                  <EditorPanel {...panelProps.css} showLabel={false} />
                )}
                {activeTab === 'javascript' && (
                  <EditorPanel {...panelProps.js} showLabel={false} />
                )}
              </div>
            </div>
          ) : (
            <Group orientation="horizontal" className="h-full">
              <Panel defaultSize={33.33} minSize={15}>
                <EditorPanel {...panelProps.html} />
              </Panel>

              <Separator className="resize-separator resize-separator-vertical">
                <ResizeHandle direction="vertical" />
              </Separator>

              <Panel defaultSize={33.33} minSize={15}>
                <EditorPanel {...panelProps.css} />
              </Panel>

              <Separator className="resize-separator resize-separator-vertical">
                <ResizeHandle direction="vertical" />
              </Separator>

              <Panel defaultSize={33.34} minSize={15}>
                <EditorPanel {...panelProps.js} />
              </Panel>
            </Group>
          )}
        </Panel>

        <Separator className="resize-separator resize-separator-horizontal">
          <ResizeHandle direction="horizontal" />
        </Separator>

        <Panel defaultSize={isMobile ? 45 : 50} minSize={isMobile ? 25 : 20}>
          <Preview srcDoc={srcDoc} logs={logs} reloadNonce={reloadNonce} />
        </Panel>
      </Group>

      <PenSettingsModal />
    </>
  )
}

function Editor() {
  return (
    <PenSettingsProvider>
      <EditorContent />
    </PenSettingsProvider>
  )
}

export default Editor
