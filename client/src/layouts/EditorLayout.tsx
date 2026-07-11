import { Outlet } from 'react-router-dom'
import EditorHeader from '@/components/EditorHeader'

function EditorLayout() {
  return (
    <div className="flex h-full flex-col bg-neutral-950 text-neutral-100">
      <EditorHeader />
      <div className="min-h-0 flex-1">
        <Outlet />
      </div>
    </div>
  )
}

export default EditorLayout
