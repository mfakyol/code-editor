import { useState } from 'react'
import EditorTitleBar from '@/components/editor/EditorTitleBar'
import EditorSaveButton from '@/components/editor/EditorSaveButton'
import EditorRunButton from '@/components/editor/EditorRunButton'
import EditorMenu from '@/components/editor/EditorMenu'
import EditorAccount from '@/components/editor/EditorAccount'
import EditorAuthModal from '@/components/editor/EditorAuthModal'
import type { AuthMode } from '@/components/AuthModal'

function EditorHeader() {
  const [authMode, setAuthMode] = useState<AuthMode | null>(null)
  const openAuth = () => setAuthMode('login')

  return (
    <header className="flex items-center justify-between gap-2 border-b border-neutral-800 bg-neutral-950 px-3 py-2.5 sm:px-4 sm:py-3">
      <EditorTitleBar />

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <EditorSaveButton openAuth={openAuth} />
        <EditorRunButton />
        <EditorMenu openAuth={openAuth} />
        <EditorAccount openAuth={openAuth} />
      </div>

      <EditorAuthModal mode={authMode} onClose={() => setAuthMode(null)} onSwitchMode={setAuthMode} />
    </header>
  )
}

export default EditorHeader
