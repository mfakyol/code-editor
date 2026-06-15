import type { SettingsTab } from '@/types/preprocessors'

type EditorTab = SettingsTab

type EditorTabsProps = {
  active: EditorTab
  onChange: (tab: EditorTab) => void
  onSettingsClick: () => void
}

const tabs: { id: EditorTab; label: string; activeColor: string }[] = [
  { id: 'html', label: 'HTML', activeColor: 'text-orange-400 border-orange-400' },
  { id: 'css', label: 'CSS', activeColor: 'text-sky-400 border-sky-400' },
  { id: 'javascript', label: 'JS', activeColor: 'text-yellow-400 border-yellow-400' },
]

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

function EditorTabs({ active, onChange, onSettingsClick }: EditorTabsProps) {
  return (
    <div className="flex items-center border-b border-neutral-800 bg-neutral-900">
      <div className="flex min-w-0 flex-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex-1 border-b-2 px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
              active === tab.id
                ? `${tab.activeColor} bg-neutral-800/50`
                : 'border-transparent text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onSettingsClick}
        className="shrink-0 px-3 py-2 text-neutral-500 hover:text-neutral-200"
        aria-label="Editor settings"
      >
        <SettingsIcon />
      </button>
    </div>
  )
}

export default EditorTabs
