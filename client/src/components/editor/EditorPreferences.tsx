import { IconLayoutSidebar, IconLayoutNavbar, IconLayoutSidebarRight, type IconProps } from '@tabler/icons-react'
import type { ComponentType } from 'react'
import Switch from '@/components/ui/Switch'
import LanguageSelect from '@/components/LanguageSelect'
import { useI18n } from '@/stores/i18n.store'
import {
  useWorkspaceStore,
  type ViewMode,
  type EditorTheme,
  MIN_FONT_SIZE,
  MAX_FONT_SIZE,
} from '@/stores/workspace.store'
import { useIsMobile } from '@/hooks/useMediaQuery'

const themeOptions: { value: EditorTheme; label: string }[] = [
  { value: 'dracula', label: 'Dracula' },
  { value: 'githubDark', label: 'GitHub Dark' },
  { value: 'githubLight', label: 'GitHub Light' },
]

const viewOptions: { mode: ViewMode; labelKey: string; Icon: ComponentType<IconProps> }[] = [
  { mode: 'left', labelKey: 'editor.view.left', Icon: IconLayoutSidebar },
  { mode: 'top', labelKey: 'editor.view.top', Icon: IconLayoutNavbar },
  { mode: 'right', labelKey: 'editor.view.right', Icon: IconLayoutSidebarRight },
]

function EditorPreferences() {
  const { t } = useI18n()
  const { fontSize, adjustFontSize, autoRun, setAutoRun, editorTheme, setEditorTheme, viewMode, setViewMode } =
    useWorkspaceStore()
  const isMobile = useIsMobile()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-neutral-200">{t('editor.fontSize')}</span>
        <div className="flex w-fit items-center rounded-md bg-neutral-800">
          <button
            type="button"
            onClick={() => adjustFontSize(-1)}
            disabled={fontSize <= MIN_FONT_SIZE}
            title={t('editor.fontDown')}
            aria-label={t('editor.fontDown')}
            className="px-2 py-1 text-sm text-neutral-300 hover:text-neutral-100 disabled:opacity-40"
          >
            A-
          </button>
          <span className="w-6 text-center text-xs text-neutral-400">{fontSize}</span>
          <button
            type="button"
            onClick={() => adjustFontSize(1)}
            disabled={fontSize >= MAX_FONT_SIZE}
            title={t('editor.fontUp')}
            aria-label={t('editor.fontUp')}
            className="px-2 py-1 text-base text-neutral-300 hover:text-neutral-100 disabled:opacity-40"
          >
            A+
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-neutral-200">{t('editor.autoRun')}</span>
        <Switch checked={autoRun} onChange={setAutoRun} label={t('editor.autoRun')} />
      </div>

      {!isMobile && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-200">{t('editor.layout')}</span>
          <div className="flex items-center gap-1" role="group" aria-label={t('editor.changeView')}>
            {viewOptions.map(({ mode, labelKey, Icon }) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                title={t(labelKey)}
                aria-label={t(labelKey)}
                aria-pressed={viewMode === mode}
                className={`flex items-center justify-center rounded-md border p-1.5 ${
                  viewMode === mode
                    ? 'border-indigo-500 bg-neutral-800 text-indigo-400'
                    : 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                <Icon className="h-4 w-4" stroke={1.75} />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-neutral-400">{t('editor.theme')}</span>
        <select
          value={editorTheme}
          onChange={(e) => setEditorTheme(e.target.value as EditorTheme)}
          title={t('editor.theme')}
          aria-label={t('editor.theme')}
          className="h-8 w-full rounded-md border border-neutral-700 bg-neutral-800 px-2 text-sm text-neutral-200 outline-none focus:border-indigo-500"
        >
          {themeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-neutral-400">{t('editor.language')}</span>
        <LanguageSelect className="w-full" />
      </div>
    </div>
  )
}

export default EditorPreferences
