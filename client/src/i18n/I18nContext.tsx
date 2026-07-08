import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { translations, type Lang } from './translations'

type Vars = Record<string, string | number>

type I18nValue = {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: string, vars?: Vars) => string
}

const I18nContext = createContext<I18nValue | null>(null)

const STORAGE_KEY = 'lang'

function detectInitial(): Lang {
  if (typeof window !== 'undefined') {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved === 'tr' || saved === 'en') return saved
    const nav = window.navigator.language?.toLowerCase() ?? ''
    if (nav.startsWith('tr')) return 'tr'
  }
  return 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => detectInitial())

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Ignore storage failures (e.g. private mode).
    }
  }, [])

  const t = useCallback(
    (key: string, vars?: Vars) => {
      const dict = translations[lang]
      let str = dict[key] ?? translations.en[key] ?? key
      if (vars) {
        for (const [name, value] of Object.entries(vars)) {
          str = str.replace(`{${name}}`, String(value))
        }
      }
      return str
    },
    [lang],
  )

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return ctx
}
