import Modal from '@/components/ui/Modal'
import AuthForm from '@/components/AuthForm'
import { useI18n } from '@/stores/i18n.store'

export type AuthMode = 'login' | 'register'

type AuthModalProps = {
  mode: AuthMode | null
  onClose: () => void
  onAuthenticated: () => void
  onSwitchMode: (mode: AuthMode) => void
}

function AuthModal({ mode, onClose, onAuthenticated, onSwitchMode }: AuthModalProps) {
  const { t } = useI18n()

  if (!mode) return null

  const isRegister = mode === 'register'

  return (
    <Modal
      open
      onClose={onClose}
      closeLabel={t('common.close')}
      title={isRegister ? t('auth.register.title') : t('auth.login.title')}
    >
      <AuthForm key={mode} mode={mode} onSuccess={onAuthenticated} />

      <p className="mt-4 text-center text-sm text-neutral-400">
        {isRegister ? t('auth.haveAccount') : t('auth.noAccount')}{' '}
        <button
          type="button"
          onClick={() => onSwitchMode(isRegister ? 'login' : 'register')}
          className="text-indigo-400 hover:text-indigo-300"
        >
          {isRegister ? t('auth.switchLogin') : t('auth.switchRegister')}
        </button>
      </p>
    </Modal>
  )
}

export default AuthModal
