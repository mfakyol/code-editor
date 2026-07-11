import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { IconUserCircle } from '@tabler/icons-react'
import userService from '@/services/user.service'
import type { PublicPen } from '@/services/pen.service'
import { GalleryGridSkeleton } from '@/components/Skeleton'
import PenCard from '@/components/PenCard'
import { useI18n } from '@/stores/i18n.store'

function Profile() {
  const { t } = useI18n()
  const { username } = useParams()
  const [pens, setPens] = useState<PublicPen[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!username) return
    let active = true
    setLoading(true)
    setError(null)
    userService.profile(username).then((res) => {
      if (!active) return
      if (res.success) setPens(res.data.pens)
      else setError(res.error.message)
      setLoading(false)
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
            <p className="text-sm text-neutral-500">{t('profile.publicPens', { count: pens.length })}</p>
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
          {t('profile.empty')}
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
