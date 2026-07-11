import type { ComponentProps } from 'react'
import { cn } from '@/utils/cn'

type ButtonVariant = 'primary' | 'secondary' | 'danger'

const variantClass: Record<ButtonVariant, string> = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-500',
  secondary: 'bg-neutral-800 text-neutral-100 hover:bg-neutral-700',
  danger: 'bg-red-600 text-white hover:bg-red-500',
}

type ButtonProps = ComponentProps<'button'> & {
  variant?: ButtonVariant
  loading?: boolean
}

function Button({
  variant = 'primary',
  loading = false,
  disabled,
  type = 'button',
  className,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading
  const colorClass = disabled && !loading ? 'bg-neutral-700 text-neutral-500' : variantClass[variant]

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={cn(
        'relative w-full rounded-md px-4 py-2 text-sm font-medium transition-colors',
        colorClass,
        isDisabled && 'cursor-not-allowed',
        loading && 'opacity-80',
        className,
      )}
      {...props}
    >
      <span className={cn('flex items-center justify-center', loading && 'invisible')}>{children}</span>
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </span>
      )}
    </button>
  )
}

export default Button
