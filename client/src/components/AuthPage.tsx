import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useI18n } from '@/stores/i18n.store'
import AuthForm from '@/components/AuthForm'

type AuthPageProps = {
  mode: 'login' | 'register'
}

function AuthPage({ mode }: AuthPageProps) {
  const { t } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  const isRegister = mode === 'register'

  const from = (location.state as { from?: string } | null)?.from ?? '/editor'
  const handleSuccess = () => navigate(isRegister ? '/editor' : from, { replace: true })

  return (
    <div className="flex h-full items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm rounded-lg border border-neutral-800 bg-neutral-900 p-6">
        <h1 className="mb-5 text-xl font-semibold">{t(isRegister ? 'auth.register.title' : 'auth.login.title')}</h1>

        <AuthForm mode={mode} onSuccess={handleSuccess} />

        <p className="mt-4 text-center text-sm text-neutral-400">
          {t(isRegister ? 'auth.haveAccount' : 'auth.noAccount')}{' '}
          <Link to={isRegister ? '/login' : '/register'} className="text-indigo-400 hover:text-indigo-300">
            {t(isRegister ? 'auth.switchLogin' : 'auth.switchRegister')}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default AuthPage
