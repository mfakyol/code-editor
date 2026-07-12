import { useI18n } from '@/stores/i18n.store'
import type { Lang } from '@/i18n/translations'
import { cn } from '@/utils/cn'

const languages: { code: Lang; label: string }[] = [
  { code: 'tr', label: 'Türkçe' },
  { code: 'en', label: 'English' },
]

type LanguageSelectProps = {
  className?: string
}

function LanguageSelect({ className }: LanguageSelectProps) {
  const { t, lang, setLang } = useI18n()

  return (
    <select
      value={lang}
      onChange={(e) => setLang(e.target.value as Lang)}
      title={t('editor.language')}
      aria-label={t('editor.language')}
      className={cn(
        'h-8 rounded-md border border-neutral-700 bg-neutral-800 px-2 text-sm text-neutral-200 outline-none focus:border-indigo-500',
        className,
      )}
    >
      {languages.map((option) => (
        <option key={option.code} value={option.code}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

export default LanguageSelect
