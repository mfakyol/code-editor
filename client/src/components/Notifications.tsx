import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCircleCheck,
  IconInfoCircle,
  type IconProps,
} from '@tabler/icons-react'
import type { ComponentType } from 'react'
import { cn } from '@/utils/cn'
import { useNotificationStore, type NotificationType } from '@/stores/notification.store'

const config: Record<NotificationType, { className: string; Icon: ComponentType<IconProps> }> = {
  success: { className: 'border-emerald-500/40 bg-emerald-950 text-emerald-200', Icon: IconCircleCheck },
  error: { className: 'border-red-500/40 bg-red-950 text-red-200', Icon: IconAlertCircle },
  warning: { className: 'border-amber-500/40 bg-amber-950 text-amber-200', Icon: IconAlertTriangle },
  info: { className: 'border-sky-500/40 bg-sky-950 text-sky-200', Icon: IconInfoCircle },
}

function Notifications() {
  const notifications = useNotificationStore((state) => state.notifications)
  const remove = useNotificationStore((state) => state.remove)

  if (notifications.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      {notifications.map((n) => {
        const { className, Icon } = config[n.type]
        return (
          <button
            key={n.id}
            type="button"
            onClick={() => remove(n.id)}
            className={cn(
              'flex w-full items-start gap-2 rounded-md border px-3 py-2 text-left text-sm shadow-lg shadow-black/30',
              className,
            )}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" stroke={1.75} />
            <span className="min-w-0 flex-1">{n.message}</span>
          </button>
        )
      })}
    </div>
  )
}

export default Notifications
