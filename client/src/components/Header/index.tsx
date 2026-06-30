import { Link, useNavigate } from 'react-router-dom'
import { IconCode } from '@tabler/icons-react'
import { useAuth } from '@/contexts/AuthContext'

function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <nav className="flex items-center gap-3 border-b border-neutral-800 px-3 py-2.5 sm:gap-4 sm:px-4 sm:py-3">
      <Link to="/" className="flex items-center gap-1.5 text-sm font-semibold sm:text-base">
        <IconCode className="h-5 w-5 text-indigo-400" stroke={2} />
        CodePen Clone
      </Link>
      <Link
        to="/editor"
        className="text-sm text-neutral-400 hover:text-neutral-100"
      >
        Editor
      </Link>
      {user && (
        <Link
          to="/pens"
          className="text-sm text-neutral-400 hover:text-neutral-100"
        >
          Pen’lerim
        </Link>
      )}

      <div className="ml-auto flex items-center gap-3 sm:gap-4">
        {user ? (
          <>
            <span className="text-sm text-neutral-300">{user.username}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm text-neutral-400 hover:text-neutral-100"
            >
              Çıkış
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-sm text-neutral-400 hover:text-neutral-100"
            >
              Giriş
            </Link>
            <Link
              to="/register"
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium hover:bg-indigo-500"
            >
              Kayıt Ol
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Header
