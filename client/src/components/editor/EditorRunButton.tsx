import { useEffect } from 'react'
import { IconPlayerPlayFilled } from '@tabler/icons-react'
import ToolbarButton from '@/components/editor/ToolbarButton'
import { useI18n } from '@/stores/i18n.store'
import { usePreviewRunner } from '@/stores/preview-runner.store'

function EditorRunButton() {
  const { t } = useI18n()
  const run = usePreviewRunner((s) => s.run)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'enter') {
        event.preventDefault()
        run({ force: true })
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [run])

  return (
    <ToolbarButton
      variant="primary"
      icon={<IconPlayerPlayFilled className="h-4 w-4" />}
      onClick={() => run({ force: true })}
      title={t('editor.runTitle')}
      labelClassName="hidden sm:inline"
    >
      {t('editor.run')}
    </ToolbarButton>
  )
}

export default EditorRunButton
