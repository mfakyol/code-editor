import type { ComponentProps } from 'react'
import { cn } from '@/utils/cn'

const baseClass = 'mb-1 block text-sm text-neutral-300'

function Label({ className, ...props }: ComponentProps<'label'>) {
  return <label className={cn(baseClass, className)} {...props} />
}

export default Label
