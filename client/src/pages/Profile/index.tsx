import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { IconUserCircle } from '@tabler/icons-react'
import { userApi, type PublicPen } from '@/config/api'
import { GalleryGridSkeleton } from '@/components/Skeleton'
import PenCard from '@/components/PenCard'

function Profile() {
  const { username } = useParams()
  const [pens, setPens] = useState<PublicPen[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!username) return
    let active = true
    setLoading(true)
    setError(null)
    userApi
      .profile(username)
      .then((res) => {
        if (active) setPens(res.pens)
      })
      .catch((err) => {
        if (active)
          setError(err instanceof Error ? err.message : 'Profil bulunamadı')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [username])

  return (
    <div className="mx-auto h-full w-full max-w-6xl overflow-auto px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center gap-3">
        <IconUserCircle className="h-10 w-10 text-indigo-400" stroke={1.5} />
        <div>
          <h1 className="text-2xl font-semibold">{username}</h1>
          {!loading && !error && (
            <p className="text-sm text-neutral-500">
              {pens.length} herkese açık pen
            </p>
          )}
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-dashed border-neutral-700 p-10 text-center text-neutral-400">
          {error}
        </div>
      ) : loading ? (
        <GalleryGridSkeleton />
      ) : pens.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-700 p-10 text-center text-neutral-400">
          Bu kullanıcının henüz herkese açık pen’i yok.
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pens.map((pen) => (
            <PenCard key={pen._id} pen={pen} showOwner={false} />
          ))}
        </ul>
      )}
    </div>
  )
}

export default Profile
