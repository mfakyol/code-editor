import { useEffect, useEffectEvent, type RefObject } from 'react'

export function useOutsideClick(ref: RefObject<HTMLElement | null>, onDismiss: () => void, enabled = true) {
  const dismiss = useEffectEvent(onDismiss)

  useEffect(() => {
    if (!enabled) return
    const onPointerDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) dismiss()
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismiss()
    }
    window.addEventListener('mousedown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [ref, enabled])
}
