import { Link } from 'react-router-dom'
import { usePreviewRunner } from '@/contexts/PreviewRunnerContext'

function EditorHeader() {
  const { run } = usePreviewRunner()

  return (
    <header className="flex items-center justify-between gap-2 border-b border-neutral-800 bg-neutral-950 px-3 py-2 sm:px-4">
      <div className="flex min-w-0 items-center gap-2 sm:gap-4">
        <Link
          to="/"
          className="shrink-0 text-xs text-neutral-400 hover:text-neutral-100 sm:text-sm"
        >
          <span className="sm:hidden">←</span>
          <span className="hidden sm:inline">← Ana Sayfa</span>
        </Link>
        <span className="truncate text-xs font-medium sm:text-sm">Untitled Pen</span>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          className="hidden rounded-md bg-neutral-800 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-700 sm:inline-block"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => run({ force: true })}
          className="rounded-md bg-indigo-600 px-2.5 py-1.5 text-xs font-medium hover:bg-indigo-500 sm:px-3 sm:text-sm"
        >
          Run
        </button>
      </div>
    </header>
  )
}

export default EditorHeader
