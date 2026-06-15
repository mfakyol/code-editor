import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-neutral-400">Sayfa bulunamadı.</p>
      <Link to="/" className="text-indigo-400 hover:text-indigo-300">
        Ana sayfaya dön
      </Link>
    </div>
  )
}

export default NotFound
