import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="flex h-full items-center justify-center px-4 py-8 sm:px-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold sm:text-3xl">CodePen Clone</h1>
        <p className="mt-2 text-sm text-neutral-400 sm:text-base">
          HTML, CSS ve JS yazıp canlı önizleyebileceğin bir alan.
        </p>
        <Link
          to="/editor"
          className="mt-6 inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500 sm:text-base"
        >
          Yeni Pen Oluştur
        </Link>
      </div>
    </div>
  )
}

export default Home
