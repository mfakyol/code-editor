import { Link } from 'react-router-dom'
import { useI18n } from '@/stores/i18n.store'
import { useWorkspaceStore } from '@/stores/workspace.store'
import { IconArrowLeft, IconEye, IconPencilFilled } from '@tabler/icons-react'

function EditorTitleBar() {
  const { t } = useI18n()
  const { title, setTitle, penId, isOwner } = useWorkspaceStore()
  const readonly = Boolean(penId) && !isOwner

  return (
    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
      <Link
        to="/"
        className="flex shrink-0 items-center gap-1 text-xs text-neutral-400 hover:text-neutral-100 sm:text-sm"
      >
        <IconArrowLeft className="h-4 w-4" stroke={1.75} />
        <span className="hidden sm:inline">{t('editor.home')}</span>
      </Link>
      {readonly ? (
        <div className="flex min-w-0 flex-col justify-center">
          <span className="max-w-[40vw] truncate text-xs font-medium sm:text-sm">{title}</span>
          <span
            title={t('editor.readonlyTitle')}
            className="inline-flex w-fit items-center gap-1 text-[10px] font-medium text-amber-400"
          >
            <IconEye className="h-3 w-3" stroke={2} />
            {t('editor.readonly')}
          </span>
        </div>
      ) : (
        <div className="relative flex min-w-0 items-center">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('editor.titlePlaceholder')}
            aria-label={t('editor.titleAria')}
            className="h-8 min-w-0 max-w-[40vw] truncate rounded border border-transparent bg-transparent pl-6 pr-1.5 text-xs font-medium hover:border-neutral-700 focus:border-indigo-500 focus:outline-none sm:text-sm"
          />
          <IconPencilFilled className="pointer-events-none absolute left-1.5 h-4 w-4 text-neutral-500" />
        </div>
      )}
    </div>
  )
}

export default EditorTitleBar
