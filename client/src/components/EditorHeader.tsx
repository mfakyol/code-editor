import EditorTitleBar from '@/components/editor/EditorTitleBar'
import EditorSaveButton from '@/components/editor/EditorSaveButton'
import EditorRunButton from '@/components/editor/EditorRunButton'
import EditorMenu from '@/components/editor/EditorMenu'
import EditorAccount from '@/components/editor/EditorAccount'
import EditorAuthModal from '@/components/editor/EditorAuthModal'

function EditorHeader() {
  return (
    <header className="flex items-center justify-between gap-2 border-b border-neutral-800 bg-neutral-950 px-3 py-2.5 sm:px-4 sm:py-3">
      <EditorTitleBar />

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <EditorSaveButton />
        <EditorRunButton />
        <EditorMenu />
        <EditorAccount />
      </div>

      <EditorAuthModal />
    </header>
  )
}

export default EditorHeader
