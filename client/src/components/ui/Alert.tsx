import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

type AlertType = 'info' | 'warning' | 'error' | 'success'

const typeClass: Record<AlertType, string> = {
  info: 'bg-sky-950 text-sky-300',
  warning: 'bg-amber-950 text-amber-300',
  error: 'bg-red-950 text-red-300',
  success: 'bg-emerald-950 text-emerald-300',
}

type AlertProps = {
  type?: AlertType
  className?: string
  children?: ReactNode
}

function Alert({ type = 'error', className, children }: AlertProps) {
  if (!children) return null

  return (
    <p role="alert" className={cn('mb-4 rounded-md px-3 py-2 text-sm', typeClass[type], className)}>
      {children}
    </p>
  )
}

export default Alert
