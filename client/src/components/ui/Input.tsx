import { useId, type ComponentProps, type ReactNode } from 'react'
import { cn } from '@/utils/cn'
import Label from './Label'

const baseClass =
  'w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-indigo-500 disabled:cursor-not-allowed disabled:bg-neutral-900 disabled:text-neutral-500'

type InputProps = ComponentProps<'input'> & {
  label?: ReactNode
  error?: string
  className?: string
}

function Input({ id, label, className, error, ...props }: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className={className}>
      {label && <Label htmlFor={inputId}>{label}</Label>}
      <input id={inputId} className={cn(baseClass, error && 'border-red-500/70')} {...props} />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
}

export default Input
