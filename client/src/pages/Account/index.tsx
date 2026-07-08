import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useI18n } from '@/i18n/I18nContext'
import { authApi } from '@/config/api'

function Account() {
  const { user, loading: authLoading } = useAuth()
  const { t } = useI18n()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{
    type: 'ok' | 'error'
    text: string
  } | null>(null)

  if (authLoading) {
    return (
      <div className="flex h-full items-center justify-center text-neutral-400">
        {t('common.loading')}
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: '/account' }} replace />
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setMessage(null)

    if (next.length < 6) {
      setMessage({ type: 'error', text: t('account.tooShort') })
      return
    }
    if (next !== confirm) {
      setMessage({ type: 'error', text: t('account.mismatch') })
      return
    }

    setSaving(true)
    try {
      await authApi.changePassword(current, next)
      setMessage({ type: 'ok', text: t('account.updated') })
      setCurrent('')
      setNext('')
      setConfirm('')
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : t('account.changeFailed'),
      })
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-indigo-500'

  return (
    <div className="mx-auto h-full w-full max-w-md overflow-auto px-4 py-8 sm:px-6">
      <h1 className="mb-1 text-2xl font-semibold">{t('account.title')}</h1>
      <p className="mb-6 text-sm text-neutral-500">
        {user.username} · {user.email} ·{' '}
        <Link to={`/u/${user.username}`} className="text-indigo-400 hover:underline">
          {t('account.viewProfile')}
        </Link>
      </p>

      <h2 className="mb-3 text-lg font-medium">
        {t('account.changePassword')}
      </h2>

      {message && (
        <p
          className={`mb-4 rounded-md px-3 py-2 text-sm ${
            message.type === 'ok'
              ? 'bg-emerald-950 text-emerald-300'
              : 'bg-red-950 text-red-300'
          }`}
        >
          {message.text}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-neutral-300">
            {t('account.current')}
          </label>
          <input
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            autoComplete="current-password"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-neutral-300">
            {t('account.new')}
          </label>
          <input
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            autoComplete="new-password"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-neutral-300">
            {t('account.confirm')}
          </label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500 disabled:opacity-50"
        >
          {saving ? t('account.saving') : t('account.update')}
        </button>
      </form>
    </div>
  )
}

export default Account
