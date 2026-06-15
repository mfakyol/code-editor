import { Outlet } from 'react-router-dom'
import Header from '@/components/Header'

function MainLayout() {
  return (
    <div className="flex h-full flex-col bg-neutral-900 text-neutral-100">
      <Header />
      <div className="min-h-0 flex-1">
        <Outlet />
      </div>
    </div>
  )
}

export default MainLayout
