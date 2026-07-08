import { useEffect, useState, type FormEvent } from 'react'
import { IconX } from '@tabler/icons-react'
import { useAuth } from '@/contexts/AuthContext'
import { useI18n } from '@/i18n/I18nContext'

export type AuthMode = 'login' | 'register'

type AuthModalProps = {
  mode: AuthMode | null
  onClose: () => void
  onAuthenticated: () => void
  onSwitchMode: (mode: AuthMode) => void
}

function AuthModal({
  mode,
  onClose,
  onAuthenticated,
  onSwitchMode,
}: AuthModalProps) {
  const { login, register } = useAuth()
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Clear errors when switching between login/register.
  useEffect(() => {
    setError(null)
  }, [mode])

  if (!mode) return null

  const isRegister = mode === 'register'

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      if (isRegister) {
        await register(email, username, password)
      } else {
        await login(email, password)
      }
      onAuthenticated()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.failed'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="presentation"
    >
      <form
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-sm rounded-lg border border-neutral-700 bg-neutral-900 p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-100">
            {isRegister ? t('auth.register.title') : t('auth.login.title')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-100"
            aria-label={t('common.close')}
          >
            <IconX className="h-5 w-5" stroke={1.75} />
          </button>
        </div>

        {error && (
          <p className="mb-4 rounded-md bg-red-950 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <label className="mb-1 block text-sm text-neutral-300">
          {t('auth.email')}
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-indigo-500"
        />

        {isRegister && (
          <>
            <label className="mb-1 block text-sm text-neutral-300">
              {t('auth.username')}
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mb-4 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-indigo-500"
            />
          </>
        )}

        <label className="mb-1 block text-sm text-neutral-300">
          {t('auth.password')}
        </label>
        <input
          type="password"
          required
          minLength={isRegister ? 6 : undefined}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-5 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-indigo-500"
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500 disabled:opacity-50"
        >
          {submitting
            ? t('auth.pleaseWait')
            : isRegister
              ? t('auth.register.title')
              : t('auth.login.title')}
        </button>

        <p className="mt-4 text-center text-sm text-neutral-400">
          {isRegister ? (
            <>
              {t('auth.haveAccount')}{' '}
              <button
                type="button"
                onClick={() => onSwitchMode('login')}
                className="text-indigo-400 hover:text-indigo-300"
              >
                {t('auth.switchLogin')}
              </button>
            </>
          ) : (
            <>
              {t('auth.noAccount')}{' '}
              <button
                type="button"
                onClick={() => onSwitchMode('register')}
                className="text-indigo-400 hover:text-indigo-300"
              >
                {t('auth.switchRegister')}
              </button>
            </>
          )}
        </p>
      </form>
    </div>
  )
}

export default AuthModal
