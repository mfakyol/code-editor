import { create } from 'zustand'

export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export type Notification = {
  id: string
  type: NotificationType
  message: string
}

type NotificationState = {
  notifications: Notification[]
  add: (type: NotificationType, message: string, duration?: number) => string
  remove: (id: string) => void
}

let counter = 0
const DEFAULT_DURATION = 4000

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  add: (type, message, duration = DEFAULT_DURATION) => {
    const id = `n${++counter}`
    set((state) => ({ notifications: [...state.notifications, { id, type, message }] }))
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({ notifications: state.notifications.filter((n) => n.id !== id) }))
      }, duration)
    }
    return id
  },
  remove: (id) => set((state) => ({ notifications: state.notifications.filter((n) => n.id !== id) })),
}))

export const notify = {
  info: (message: string, duration?: number) => useNotificationStore.getState().add('info', message, duration),
  success: (message: string, duration?: number) => useNotificationStore.getState().add('success', message, duration),
  warning: (message: string, duration?: number) => useNotificationStore.getState().add('warning', message, duration),
  error: (message: string, duration?: number) => useNotificationStore.getState().add('error', message, duration),
  dismiss: (id: string) => useNotificationStore.getState().remove(id),
}
