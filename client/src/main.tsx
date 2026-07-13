import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@/styles/global.css'
import AppRoutes from '@/Routes'
import Notifications from '@/components/Notifications'
import ErrorBoundary from '@/components/ErrorBoundary'
import authService from '@/services/auth.service'

authService.loadUser()

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <BrowserRouter>
      <AppRoutes />
      <Notifications />
    </BrowserRouter>
  </ErrorBoundary>,
)
