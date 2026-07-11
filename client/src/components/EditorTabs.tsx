import { IconSettings } from '@tabler/icons-react'
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
        <IconSettings className="h-4 w-4" stroke={1.75} />
      </button>
    </div>
  )
}

export default EditorTabs
