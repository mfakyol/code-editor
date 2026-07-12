import { useEffect, useState } from 'react'
import AuthForm from '@/components/AuthForm'
import { useI18n } from '@/stores/i18n.store'
import { notify } from '@/stores/notification.store'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'

function Login() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  const [from] = useState(() => {
    const param = searchParams.get('from')
    if (param && param.startsWith('/') && !param.startsWith('//')) return param
    return (location.state as { from?: string } | null)?.from ?? '/pen'
  })

  useEffect(() => {
    if (searchParams.get('session') === 'expired') {
      notify.warning(t('auth.sessionExpired'))
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams, t])

  return (
    <>
      <h1 className="mb-5 text-xl font-semibold">{t('auth.login.title')}</h1>

      <AuthForm mode="login" onSuccess={() => navigate(from, { replace: true })} />

      <p className="mt-4 text-center text-sm text-neutral-400">
        {t('auth.noAccount')}{' '}
        <Link to="/register" className="text-indigo-400 hover:text-indigo-300">
          {t('auth.switchRegister')}
        </Link>
      </p>
    </>
  )
}

export default Login
