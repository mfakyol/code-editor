import { useEffect, useState } from 'react'
import penService, { type PublicPen } from '@/services/pen.service'
import { GalleryGridSkeleton } from '@/components/Skeleton'
import PenCard from '@/components/PenCard'
import { useI18n } from '@/stores/i18n.store'

type SortMode = 'recent' | 'popular'

function Explore() {
  const { t } = useI18n()
  const [pens, setPens] = useState<PublicPen[]>([])
  const [sort, setSort] = useState<SortMode>('recent')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    penService
      .publicList(sort)
      .then((res) => {
        if (active) setPens(res.pens)
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : t('explore.loadFailed'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [sort])

  return (
    <div className="mx-auto h-full w-full max-w-6xl overflow-auto px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{t('explore.title')}</h1>
        <div className="flex items-center rounded-md bg-neutral-800 p-0.5 text-sm">
          {(['recent', 'popular'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setSort(mode)}
              className={`rounded px-3 py-1.5 ${
                sort === mode ? 'bg-neutral-700 text-neutral-100' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {mode === 'recent' ? t('explore.recent') : t('explore.popular')}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mb-4 rounded-md bg-red-950 px-3 py-2 text-sm text-red-300">{error}</p>}

      {loading ? (
        <GalleryGridSkeleton />
      ) : pens.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-700 p-10 text-center text-neutral-400">
          {t('explore.empty')}
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pens.map((pen) => (
            <PenCard key={pen._id} pen={pen} />
          ))}
        </ul>
      )}
    </div>
  )
}

export default Explore
