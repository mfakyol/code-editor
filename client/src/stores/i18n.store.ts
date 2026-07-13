import { create } from 'zustand'
import { translations, type Lang, type TranslationKey } from '@/i18n/translations'

type Vars = Record<string, string | number>

type I18nState = {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: TranslationKey, vars?: Vars) => string
}

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

export const useI18n = create<I18nState>((set, get) => ({
  lang: detectInitial(),
  setLang: (lang) => {
    set({ lang })
    try {
      window.localStorage.setItem(STORAGE_KEY, lang)
    } catch {}
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang
    }
  },
  t: (key, vars) => {
    const dict = translations[get().lang]
    let str = dict[key] ?? translations.en[key] ?? key
    if (vars) {
      for (const [name, value] of Object.entries(vars)) {
        str = str.replace(`{${name}}`, String(value))
      }
    }
    return str
  },
}))

if (typeof document !== 'undefined') {
  document.documentElement.lang = useI18n.getState().lang
}
