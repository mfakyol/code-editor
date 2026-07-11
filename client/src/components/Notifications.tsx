import Alert from '@/components/ui/Alert'
import { useNotificationStore } from '@/stores/notification.store'

function Notifications() {
  const notifications = useNotificationStore((state) => state.notifications)
  const remove = useNotificationStore((state) => state.remove)

  if (notifications.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      {notifications.map((n) => (
        <button key={n.id} type="button" onClick={() => remove(n.id)} className="block text-left">
          <Alert type={n.type} className="!mb-0 shadow-lg shadow-black/30">
            {n.message}
          </Alert>
        </button>
      ))}
    </div>
  )
}

export default Notifications
