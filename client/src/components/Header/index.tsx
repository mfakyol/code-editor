import { Link } from 'react-router-dom'

function Header() {
  return (
    <nav className="flex items-center gap-3 border-b border-neutral-800 px-3 py-2.5 sm:gap-4 sm:px-4 sm:py-3">
      <Link to="/" className="text-sm font-semibold sm:text-base">
        CodePen Clone
      </Link>
      <Link
        to="/editor"
        className="text-sm text-neutral-400 hover:text-neutral-100"
      >
        Editor
      </Link>
    </nav>
  )
}

export default Header
