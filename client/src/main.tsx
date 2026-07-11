import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@/styles/global.css'
import AppRoutes from '@/Routes'
import Notifications from '@/components/Notifications'
import authService from '@/services/auth.service'

authService.loadUser()

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AppRoutes />
    <Notifications />
  </BrowserRouter>,
)
