import { useEffect, useState, type ReactNode } from 'react'
import { IconX } from '@tabler/icons-react'
import ResourceList from '@/components/ResourceList'
import { usePenSettings } from '@/contexts/PenSettingsContext'
import { useI18n } from '@/i18n/I18nContext'
import type {
  CssPreprocessor,
  HtmlPreprocessor,
  JsPreprocessor,
  SettingsTab,
} from '@/types/preprocessors'

type ModalTab = SettingsTab | 'scripts' | 'styles'

const tabs: { id: ModalTab; label: string }[] = [
  { id: 'html', label: 'HTML' },
  { id: 'css', label: 'CSS' },
  { id: 'javascript', label: 'JS' },
  { id: 'scripts', label: 'Scripts' },
  { id: 'styles', label: 'Styles' },
]

const htmlOptions: { value: HtmlPreprocessor; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'pug', label: 'Pug' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'haml', label: 'Haml' },
]

const cssOptions: { value: CssPreprocessor; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'sass', label: 'Sass' },
  { value: 'scss', label: 'SCSS' },
  { value: 'less', label: 'Less' },
  { value: 'stylus', label: 'Stylus' },
]

const jsOptions: { value: JsPreprocessor; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'coffeescript', label: 'CoffeeScript' },
  { value: 'babel', label: 'Babel (JSX)' },
]

function PenSettingsModal() {
  const { isOpen, activeTab, settings, closeSettings, updateSettings } =
    usePenSettings()
  const { t } = useI18n()
  const [tab, setTab] = useState<ModalTab>(activeTab)

  // Opening from an editor panel's gear should jump to that panel's tab.
  useEffect(() => {
    setTab(activeTab)
  }, [activeTab])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={closeSettings}
      role="presentation"
    >
      <div
        className="flex h-[min(80vh,640px)] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-neutral-700 bg-neutral-900 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pen-settings-title"
      >
        <header className="flex items-center justify-between border-b border-neutral-700 px-5 py-4">
          <h2 id="pen-settings-title" className="text-lg font-semibold text-neutral-100">
            {t('penSettings.title')}
          </h2>
          <button
            type="button"
            onClick={closeSettings}
            className="text-neutral-400 hover:text-neutral-100"
            aria-label={t('common.close')}
          >
            <IconX className="h-5 w-5" stroke={1.75} />
          </button>
        </header>

        <div className="flex min-h-0 flex-1">
          <nav className="w-44 shrink-0 border-r border-neutral-700 bg-neutral-950 py-2">
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`relative w-full px-4 py-2.5 text-left text-sm ${
                  tab === item.id
                    ? 'bg-neutral-800 text-neutral-100'
                    : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200'
                }`}
              >
                {tab === item.id && (
                  <span className="absolute inset-y-1 left-0 w-1 rounded-r bg-emerald-500" />
                )}
                {item.label}
              </button>
            ))}
          </nav>

          <div className="min-w-0 flex-1 overflow-auto p-6">
            {tab === 'html' && (
              <SettingField label="HTML Preprocessor">
                <select
                  value={settings.htmlPreprocessor}
                  onChange={(event) =>
                    updateSettings({
                      htmlPreprocessor: event.target.value as HtmlPreprocessor,
                    })
                  }
                  className="w-full max-w-xs rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-indigo-500"
                >
                  {htmlOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </SettingField>
            )}

            {tab === 'css' && (
              <SettingField label="CSS Preprocessor">
                <select
                  value={settings.cssPreprocessor}
                  onChange={(event) =>
                    updateSettings({
                      cssPreprocessor: event.target.value as CssPreprocessor,
                    })
                  }
                  className="w-full max-w-xs rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-indigo-500"
                >
                  {cssOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </SettingField>
            )}

            {tab === 'javascript' && (
              <SettingField label="JS Preprocessor">
                <select
                  value={settings.jsPreprocessor}
                  onChange={(event) =>
                    updateSettings({
                      jsPreprocessor: event.target.value as JsPreprocessor,
                    })
                  }
                  className="w-full max-w-xs rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-indigo-500"
                >
                  {jsOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </SettingField>
            )}

            {tab === 'scripts' && (
              <ResourceList
                label={t('res.scripts.label')}
                description={t('res.scripts.desc')}
                placeholder="https://cdn.example.com/library.js"
                emptyText={t('res.scripts.empty')}
                items={settings.externalScripts}
                onChange={(items) =>
                  updateSettings({ externalScripts: items })
                }
              />
            )}

            {tab === 'styles' && (
              <ResourceList
                label={t('res.styles.label')}
                description={t('res.styles.desc')}
                placeholder="https://cdn.example.com/library.css"
                emptyText={t('res.styles.empty')}
                items={settings.externalStyles}
                onChange={(items) =>
                  updateSettings({ externalStyles: items })
                }
              />
            )}
          </div>
        </div>

        <footer className="flex justify-end border-t border-neutral-700 px-5 py-4">
          <button
            type="button"
            onClick={closeSettings}
            className="rounded-md bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            {t('common.close')}
          </button>
        </footer>
      </div>
    </div>
  )
}

function SettingField({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-neutral-300">
        {label}
      </label>
      {children}
    </div>
  )
}

export default PenSettingsModal
