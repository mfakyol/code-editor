import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconDeviceFloppy } from '@tabler/icons-react'
import ToolbarButton from '@/components/editor/ToolbarButton'
import { useI18n } from '@/stores/i18n.store'
import { useWorkspaceStore } from '@/stores/workspace.store'
import { useAuthStore } from '@/stores/auth.store'
import { useEditorStore } from '@/stores/editor.store'
import { notify } from '@/stores/notification.store'
import penService from '@/services/pen.service'
import { clearDraft } from '@/utils/draft'

function EditorSaveButton() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const isOwner = useWorkspaceStore((s) => s.isOwner)
  const [saving, setSaving] = useState(false)

  const doSave = async () => {
    const ws = useWorkspaceStore.getState()
    const source = ws.getSource()
    if (!source) return

    setSaving(true)
    const payload = { title: ws.title, isPublic: ws.isPublic, ...source }
    const res = ws.penId ? await penService.update(ws.penId, payload) : await penService.create(payload)
    setSaving(false)

    if (!res.success) {
      notify.error(res.error.message)
      return
    }
    if (!ws.penId) {
      ws.setPenId(res.data.pen._id)
      ws.setIsOwner(true)
      clearDraft()
      navigate(`/pen/${res.data.pen._id}`)
    }
    ws.markSaved()
  }

  const handleSave = () => {
    const ws = useWorkspaceStore.getState()
    if (ws.penId && !ws.isOwner) {
      notify.warning(t('editor.status.notYours'))
      return
    }
    if (!useAuthStore.getState().user) {
      useEditorStore.setState({ authMode: 'login', pendingAction: doSave })
      return
    }
    void doSave()
  }

  const handleSaveRef = useRef(handleSave)
  handleSaveRef.current = handleSave

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        handleSaveRef.current()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  if (!isOwner) return null

  return (
    <ToolbarButton
      icon={<IconDeviceFloppy className="h-4 w-4 shrink-0" stroke={1.75} />}
      onClick={handleSave}
      loading={saving}
      title={t('editor.saveTitle')}
      labelClassName="hidden sm:inline"
    >
      {t('editor.save')}
    </ToolbarButton>
  )
}

export default EditorSaveButton
