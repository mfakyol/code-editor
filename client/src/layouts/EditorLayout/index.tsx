import { Outlet } from 'react-router-dom'
import EditorHeader from '@/components/EditorHeader'
import { PreviewRunnerProvider } from '@/contexts/PreviewRunnerContext'

function EditorLayout() {
  return (
    <PreviewRunnerProvider>
      <div className="flex h-full flex-col bg-neutral-950 text-neutral-100">
        <EditorHeader />
        <div className="min-h-0 flex-1">
          <Outlet />
        </div>
      </div>
    </PreviewRunnerProvider>
  )
}

export default EditorLayout
