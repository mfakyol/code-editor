import { Link } from 'react-router-dom'
import { useI18n } from '@/i18n/I18nContext'

function NotFound() {
  const { t } = useI18n()
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-neutral-400">{t('notFound.text')}</p>
      <Link to="/" className="text-indigo-400 hover:text-indigo-300">
        {t('notFound.back')}
      </Link>
    </div>
  )
}

export default NotFound
