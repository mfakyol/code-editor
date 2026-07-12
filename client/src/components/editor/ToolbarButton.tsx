import type { ComponentProps, ReactNode } from 'react'
import { IconLoader2 } from '@tabler/icons-react'
import { cn } from '@/utils/cn'

type ToolbarVariant = 'neutral' | 'primary' | 'success' | 'like'

const VARIANTS: Record<ToolbarVariant, string> = {
  neutral: 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700',
  primary: 'bg-indigo-600 font-medium text-white hover:bg-indigo-500',
  success: 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30',
  like: 'bg-rose-600/20 text-rose-400 hover:bg-rose-600/30',
}

type ToolbarButtonProps = ComponentProps<'button'> & {
  icon: ReactNode
  variant?: ToolbarVariant
  menu?: boolean
  labelClassName?: string
  loading?: boolean
}

function ToolbarButton({
  icon,
  variant = 'neutral',
  menu = false,
  loading = false,
  className,
  labelClassName,
  children,
  disabled,
  type = 'button',
  ...props
}: ToolbarButtonProps) {
  const layout = menu
    ? 'relative flex w-full items-center rounded-md px-3 py-2 text-left text-sm'
    : 'relative inline-flex h-8 items-center rounded-md px-2.5 text-sm'

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(layout, VARIANTS[variant], !loading && 'disabled:opacity-50', className)}
      {...props}
    >
      <span className={cn('flex items-center', menu ? 'gap-2' : 'gap-1.5', loading && 'invisible')}>
        {icon}
        {children != null && <span className={labelClassName}>{children}</span>}
      </span>
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <IconLoader2 className="h-4 w-4 animate-spin" stroke={1.75} />
        </span>
      )}
    </button>
  )
}

export default ToolbarButton
