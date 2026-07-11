import { Outlet } from 'react-router-dom'

// Centered card shell shared by all auth routes (login, register, and future
// ones like forgot-password). Each page renders its own heading, form and footer.
function AuthLayout() {
  return (
    <div className="flex h-full items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm rounded-lg border border-neutral-800 bg-neutral-900 p-6">
        <Outlet />
      </div>
    </div>
  )
}

export default AuthLayout
