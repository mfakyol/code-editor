import { cn } from '@/utils/cn'
import { IconX } from '@tabler/icons-react'
import { useEffect, type ReactNode } from 'react'

type ModalProps = {
  open: boolean
  onClose: () => void
  title?: ReactNode
  closeLabel?: string
  className?: string
  children: ReactNode
}

function Modal({ open, onClose, title, closeLabel = 'Close', className, children }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className={cn('w-full max-w-sm rounded-lg border border-neutral-700 bg-neutral-900 p-6 shadow-2xl', className)}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          {title && <h2 className="text-lg font-semibold text-neutral-100">{title}</h2>}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto text-neutral-400 hover:text-neutral-100"
            aria-label={closeLabel}
          >
            <IconX className="h-5 w-5" stroke={1.75} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default Modal
