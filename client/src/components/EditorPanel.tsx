import { memo } from 'react'
import { IconSettings } from '@tabler/icons-react'
import CodeEditor from '@/components/CodeEditor'
import type { EditorMode } from '@/types/editor'
import type { SettingsTab } from '@/types/preprocessors'

type EditorPanelProps = {
  label: string
  labelColor: string
  value: string
  mode: EditorMode
  settingsTab: SettingsTab
  onChange: (value: string) => void
  onOpenSettings: (tab: SettingsTab) => void
  showLabel?: boolean
}

function EditorPanel({
  label,
  labelColor,
  value,
  mode,
  settingsTab,
  onChange,
  onOpenSettings,
  showLabel = true,
}: EditorPanelProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      {showLabel && (
        <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900 px-3 py-1.5">
          <span className={`text-xs font-semibold uppercase tracking-wide ${labelColor}`}>{label}</span>
          <button
            onClick={() => onOpenSettings(settingsTab)}
            className="text-neutral-500 hover:text-neutral-200"
            aria-label={`${label} settings`}
          >
            <IconSettings className="h-4 w-4" stroke={1.75} />
          </button>
        </div>
      )}
      <div className="min-h-0 flex-1">
        <CodeEditor value={value} mode={mode} onChange={onChange} />
      </div>
    </div>
  )
}

export default memo(EditorPanel)
