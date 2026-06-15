import CodeEditor from '@/components/CodeEditor'
import type { EditorMode } from '@/types/editor'

type EditorPanelProps = {
  label: string
  labelColor: string
  value: string
  mode: EditorMode
  onChange: (value: string) => void
  onSettingsClick: () => void
  showLabel?: boolean
}

function SettingsIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M7.84 1.804A1 1 0 0 1 8.82 1h2.36a1 1 0 0 1 .98.804l.331 1.652a6.993 6.993 0 0 1 1.929 1.115l1.598-.54a1 1 0 0 1 1.186.447l1.18 2.044a1 1 0 0 1-.205 1.251l-1.267 1.113a7.047 7.047 0 0 1 0 2.228l1.267 1.113a1 1 0 0 1 .206 1.25l-1.18 2.045a1 1 0 0 1-1.187.447l-1.598-.54a6.993 6.993 0 0 1-1.929 1.115l-.33 1.652a1 1 0 0 1-.98.804H8.82a1 1 0 0 1-.98-.804l-.331-1.652a6.993 6.993 0 0 1-1.929-1.115l-1.598.54a1 1 0 0 1-1.186-.447l-1.18-2.044a1 1 0 0 1 .205-1.251l1.267-1.113a7.047 7.047 0 0 1 0-2.228L2.14 6.165a1 1 0 0 1-.206-1.25l1.18-2.045a1 1 0 0 1 1.187-.447l1.598.54A6.992 6.992 0 0 1 7.93 2.908l.33-1.652Z"
        clipRule="evenodd"
      />
      <path d="M10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    </svg>
  )
}

function EditorPanel({
  label,
  labelColor,
  value,
  mode,
  onChange,
  onSettingsClick,
  showLabel = true,
}: EditorPanelProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      {showLabel && (
        <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900 px-3 py-1.5">
          <span className={`text-xs font-semibold uppercase tracking-wide ${labelColor}`}>
            {label}
          </span>
          <button
            type="button"
            onClick={onSettingsClick}
            className="text-neutral-500 hover:text-neutral-200"
            aria-label={`${label} settings`}
          >
            <SettingsIcon />
          </button>
        </div>
      )}
      <div className="min-h-0 flex-1">
        <CodeEditor value={value} mode={mode} onChange={onChange} />
      </div>
    </div>
  )
}

export default EditorPanel
