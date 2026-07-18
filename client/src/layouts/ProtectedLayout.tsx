import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { useI18n } from '@/stores/i18n.store'

function ProtectedLayout() {
  const { t } = useI18n()
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)
  const location = useLocation()

  if (loading) {
    return <div className="flex h-full items-center justify-center text-neutral-400">{t('common.loading')}</div>
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />
  }

  return <Outlet />
}

export default ProtectedLayout
