import { useEffect, useState } from 'react'
import penService, { PAGE_SIZE, type PublicPen } from '@/services/pen.service'
import { GalleryGridSkeleton } from '@/components/Skeleton'
import PenCard from '@/components/PenCard'
import { useI18n } from '@/stores/i18n.store'

type SortMode = 'recent' | 'popular'

function Explore() {
  const { t } = useI18n()
  const [pens, setPens] = useState<PublicPen[]>([])
  const [sort, setSort] = useState<SortMode>('recent')
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    penService.publicList(sort, { limit: PAGE_SIZE, offset: 0 }).then((res) => {
      if (!active) return
      if (res.success) {
        setPens(res.data.pens)
        setHasMore(res.data.pens.length === PAGE_SIZE)
      } else {
        setError(res.error.message)
      }
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [sort])

  const loadMore = async () => {
    setLoadingMore(true)
    const res = await penService.publicList(sort, { limit: PAGE_SIZE, offset: pens.length })
    setLoadingMore(false)
    if (res.success) {
      setPens((current) => [...current, ...res.data.pens])
      setHasMore(res.data.pens.length === PAGE_SIZE)
    } else {
      setError(res.error.message)
    }
  }

  return (
    <div className="mx-auto h-full w-full max-w-6xl overflow-auto px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{t('explore.title')}</h1>
        <div className="flex items-center rounded-md bg-neutral-800 p-0.5 text-sm">
          {(['recent', 'popular'] as SortMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setSort(mode)}
              disabled={loading}
              className={`rounded px-3 py-1.5 disabled:opacity-50 ${
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
        <>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pens.map((pen) => (
              <PenCard key={pen._id} pen={pen} />
            ))}
          </ul>

          {hasMore && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="rounded-md border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm text-neutral-200 hover:border-neutral-600 disabled:opacity-50"
              >
                {loadingMore ? t('explore.loadingMore') : t('explore.loadMore')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Explore
