import { useI18n } from '@/i18n/I18nContext'
import type { Lang } from '@/i18n/translations'

type LanguageSwitcherProps = {
  /** Slightly smaller variant used in the compact editor header. */
  compact?: boolean
}

const langs: Lang[] = ['tr', 'en']

function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const { lang, setLang } = useI18n()

  return (
    <div
      className="flex items-center rounded-md border border-neutral-700 bg-neutral-800/60 p-0.5"
      role="group"
      aria-label="Dil / Language"
    >
      {langs.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          className={`rounded ${compact ? 'px-1.5 py-0.5 text-[11px]' : 'px-2 py-0.5 text-xs'} font-medium uppercase transition ${
            lang === code
              ? 'bg-indigo-600 text-white'
              : 'text-neutral-400 hover:text-neutral-100'
          }`}
        >
          {code}
        </button>
      ))}
    </div>
  )
}

export default LanguageSwitcher
