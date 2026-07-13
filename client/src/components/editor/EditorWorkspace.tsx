import type { ComponentProps } from 'react'
import { Group, Panel, Separator } from 'react-resizable-panels'
import EditorPanel from '@/components/EditorPanel'
import EditorTabs from '@/components/EditorTabs'
import ResizeHandle from '@/components/ResizeHandle'
import Preview from '@/components/Preview'
import type { ViewMode } from '@/stores/preferences.store'
import type { SettingsTab } from '@/types/preprocessors'

type Panels = Record<'html' | 'css' | 'js', ComponentProps<typeof EditorPanel>>

type EditorWorkspaceProps = {
  panels: Panels
  viewMode: ViewMode
  isMobile: boolean
  activeTab: SettingsTab
  onTabChange: (tab: SettingsTab) => void
  onSettings: (tab: SettingsTab) => void
}

function EditorColumns({ panels, orientation }: { panels: Panels; orientation: 'horizontal' | 'vertical' }) {
  const sepClass = orientation === 'horizontal' ? 'resize-separator-vertical' : 'resize-separator-horizontal'
  const handleDir = orientation === 'horizontal' ? 'vertical' : 'horizontal'

  return (
    <Group orientation={orientation} className="h-full">
      <Panel defaultSize={33.33} minSize={15}>
        <EditorPanel {...panels.html} />
      </Panel>
      <Separator className={`resize-separator ${sepClass}`}>
        <ResizeHandle direction={handleDir} />
      </Separator>
      <Panel defaultSize={33.33} minSize={15}>
        <EditorPanel {...panels.css} />
      </Panel>
      <Separator className={`resize-separator ${sepClass}`}>
        <ResizeHandle direction={handleDir} />
      </Separator>
      <Panel defaultSize={33.34} minSize={15}>
        <EditorPanel {...panels.js} />
      </Panel>
    </Group>
  )
}

function DesktopWorkspace({ panels, viewMode }: { panels: Panels; viewMode: ViewMode }) {
  if (viewMode === 'top') {
    return (
      <Group key="top" orientation="vertical" className="h-full">
        <Panel defaultSize={50} minSize={20}>
          <EditorColumns panels={panels} orientation="horizontal" />
        </Panel>
        <Separator className="resize-separator resize-separator-horizontal">
          <ResizeHandle direction="horizontal" />
        </Separator>
        <Panel defaultSize={50} minSize={20}>
          <Preview />
        </Panel>
      </Group>
    )
  }

  const editors = (
    <Panel defaultSize={50} minSize={20}>
      <EditorColumns panels={panels} orientation="vertical" />
    </Panel>
  )
  const previewPanel = (
    <Panel defaultSize={50} minSize={20}>
      <Preview />
    </Panel>
  )

  return (
    <Group key={viewMode} orientation="horizontal" className="h-full">
      {viewMode === 'left' ? editors : previewPanel}
      <Separator className="resize-separator resize-separator-vertical">
        <ResizeHandle direction="vertical" />
      </Separator>
      {viewMode === 'left' ? previewPanel : editors}
    </Group>
  )
}

function MobileWorkspace({
  panels,
  activeTab,
  onTabChange,
  onSettings,
}: Omit<EditorWorkspaceProps, 'viewMode' | 'isMobile'>) {
  return (
    <Group orientation="vertical" className="h-full">
      <Panel defaultSize={55} minSize={30}>
        <div className="flex h-full min-h-0 flex-col">
          <EditorTabs active={activeTab} onChange={onTabChange} onSettingsClick={() => onSettings(activeTab)} />
          <div className="min-h-0 flex-1">
            {activeTab === 'html' && <EditorPanel {...panels.html} showLabel={false} />}
            {activeTab === 'css' && <EditorPanel {...panels.css} showLabel={false} />}
            {activeTab === 'javascript' && <EditorPanel {...panels.js} showLabel={false} />}
          </div>
        </div>
      </Panel>
      <Separator className="resize-separator resize-separator-horizontal">
        <ResizeHandle direction="horizontal" />
      </Separator>
      <Panel defaultSize={45} minSize={25}>
        <Preview />
      </Panel>
    </Group>
  )
}

function EditorWorkspace({ panels, viewMode, isMobile, activeTab, onTabChange, onSettings }: EditorWorkspaceProps) {
  if (isMobile) {
    return <MobileWorkspace panels={panels} activeTab={activeTab} onTabChange={onTabChange} onSettings={onSettings} />
  }
  return <DesktopWorkspace panels={panels} viewMode={viewMode} />
}

export default EditorWorkspace
