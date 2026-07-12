import AuthModal, { type AuthMode } from '@/components/AuthModal'
import { useEditorStore } from '@/stores/editor.store'

function EditorAuthModal() {
  const authMode = useEditorStore((s) => s.authMode)

  const close = () => useEditorStore.setState({ authMode: null, pendingAction: null })

  const onAuthenticated = () => {
    const { pendingAction } = useEditorStore.getState()
    useEditorStore.setState({ authMode: null, pendingAction: null })
    pendingAction?.()
  }

  const onSwitchMode = (mode: AuthMode) => useEditorStore.setState({ authMode: mode })

  return <AuthModal mode={authMode} onClose={close} onAuthenticated={onAuthenticated} onSwitchMode={onSwitchMode} />
}

export default EditorAuthModal
