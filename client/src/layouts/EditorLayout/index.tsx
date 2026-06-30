import { Outlet } from 'react-router-dom'
import EditorHeader from '@/components/EditorHeader'
import { PreviewRunnerProvider } from '@/contexts/PreviewRunnerContext'
import { WorkspaceProvider } from '@/contexts/WorkspaceContext'

function EditorLayout() {
  return (
    <PreviewRunnerProvider>
      <WorkspaceProvider>
        <div className="flex h-full flex-col bg-neutral-950 text-neutral-100">
          <EditorHeader />
          <div className="min-h-0 flex-1">
            <Outlet />
          </div>
        </div>
      </WorkspaceProvider>
    </PreviewRunnerProvider>
  )
}

export default EditorLayout
