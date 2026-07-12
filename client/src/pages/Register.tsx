import AuthForm from '@/components/AuthForm'
import { useI18n } from '@/stores/i18n.store'
import { Link, useNavigate } from 'react-router-dom'

function Register() {
  const { t } = useI18n()
  const navigate = useNavigate()

  return (
    <>
      <h1 className="mb-5 text-xl font-semibold">{t('auth.register.title')}</h1>

      <AuthForm mode="register" onSuccess={() => navigate('/pen', { replace: true })} />

      <p className="mt-4 text-center text-sm text-neutral-400">
        {t('auth.haveAccount')}{' '}
        <Link to="/login" className="text-indigo-400 hover:text-indigo-300">
          {t('auth.switchLogin')}
        </Link>
      </p>
    </>
  )
}

export default Register
