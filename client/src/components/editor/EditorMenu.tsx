import { useRef, useState } from 'react'
import { IconDotsVertical, IconX } from '@tabler/icons-react'
import ToolbarButton from '@/components/editor/ToolbarButton'
import EditorPreferences from '@/components/editor/EditorPreferences'
import EditorActions from '@/components/editor/EditorActions'
import { useI18n } from '@/stores/i18n.store'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { useOutsideClick } from '@/hooks/useOutsideClick'

type EditorMenuProps = { openAuth: () => void }

function EditorMenu({ openAuth }: EditorMenuProps) {
  const { t } = useI18n()
  const label = t('editor.menu')
  const [open, setOpen] = useState(false)
  const isMobile = useIsMobile()
  const ref = useRef<HTMLDivElement>(null)

  useOutsideClick(ref, () => setOpen(false), open)

  const content = (
    <>
      <EditorPreferences />
      <div className="h-px bg-neutral-800" />
      <EditorActions openAuth={openAuth} />
    </>
  )

  return (
    <div className="relative" ref={ref}>
      <ToolbarButton
        icon={<IconDotsVertical className="h-4 w-4" stroke={1.75} />}
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={label}
      />

      {open &&
        (isMobile ? (
          <div className="fixed inset-0 z-50 flex flex-col bg-neutral-950">
            <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
              <span className="text-sm font-semibold text-neutral-100">{label}</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t('common.close')}
                className="rounded-md p-1 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"
              >
                <IconX className="h-5 w-5" stroke={1.75} />
              </button>
            </div>
            <div className="flex flex-1 flex-col gap-4 overflow-auto p-4">{content}</div>
          </div>
        ) : (
          <div className="absolute right-0 z-50 mt-2 flex w-64 flex-col gap-3 rounded-md border border-neutral-700 bg-neutral-900 p-3 shadow-xl">
            {content}
          </div>
        ))}
    </div>
  )
}

export default EditorMenu
