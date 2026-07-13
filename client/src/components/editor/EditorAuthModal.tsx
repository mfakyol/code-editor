import AuthModal, { type AuthMode } from '@/components/AuthModal'

type EditorAuthModalProps = {
  mode: AuthMode | null
  onClose: () => void
  onSwitchMode: (mode: AuthMode) => void
}

function EditorAuthModal({ mode, onClose, onSwitchMode }: EditorAuthModalProps) {
  return <AuthModal mode={mode} onClose={onClose} onAuthenticated={onClose} onSwitchMode={onSwitchMode} />
}

export default EditorAuthModal
