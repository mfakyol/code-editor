import { useI18n } from '@/stores/i18n.store'
import { useAuthStore } from '@/stores/auth.store'
import AccountMenu from '@/components/AccountMenu'
import { useEditorStore } from '@/stores/editor.store'

function EditorAccount() {
  const { t } = useI18n()
  const user = useAuthStore((s) => s.user)

  if (!user) {
    return (
      <button
        type="button"
        onClick={() => useEditorStore.setState({ authMode: 'login' })}
        className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-neutral-900 hover:bg-neutral-200"
      >
        {t('editor.login')}
      </button>
    )
  }

  return <AccountMenu />
}

export default EditorAccount
