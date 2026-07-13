import { useEffect, useEffectEvent, useState } from 'react'
import { IconPlayerPlayFilled } from '@tabler/icons-react'
import ToolbarButton from '@/components/editor/ToolbarButton'
import { useI18n } from '@/stores/i18n.store'
import { usePreviewStore } from '@/stores/preview.store'

function EditorRunButton() {
  const { t } = useI18n()
  const [running, setRunning] = useState(false)

  const run = async () => {
    setRunning(true)
    await usePreviewStore.getState().run({ force: true })
    setRunning(false)
  }

  const onRunShortcut = useEffectEvent(run)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'enter') {
        event.preventDefault()
        onRunShortcut()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <ToolbarButton
      variant="primary"
      icon={<IconPlayerPlayFilled className="h-4 w-4" />}
      onClick={run}
      loading={running}
      title={t('editor.runTitle')}
      labelClassName="hidden sm:inline"
    >
      {t('editor.run')}
    </ToolbarButton>
  )
}

export default EditorRunButton
