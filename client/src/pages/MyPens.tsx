import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { IconPlus, IconTrash, IconCode, IconWorld, IconLock } from '@tabler/icons-react'
import { useI18n } from '@/stores/i18n.store'
import penService, { type PenSummary } from '@/services/pen.service'
import { PenListSkeleton } from '@/components/Skeleton'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString()
}

function MyPens() {
  const { t } = useI18n()
  const [pens, setPens] = useState<PenSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    penService.list().then((res) => {
      if (!active) return
      if (res.success) setPens(res.data.pens)
      else setError(res.error.message)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('myPens.confirmDelete'))) return
    setDeletingId(id)
    const res = await penService.remove(id)
    setDeletingId(null)
    if (res.success) {
      setPens((current) => current.filter((pen) => pen._id !== id))
    } else {
      setError(res.error.message)
    }
  }

  return (
    <div className="mx-auto h-full w-full max-w-4xl overflow-auto px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t('myPens.title')}</h1>
        <Link
          to="/pen"
          className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium hover:bg-indigo-500"
        >
          <IconPlus className="h-4 w-4" stroke={2} />
          {t('myPens.new')}
        </Link>
      </div>

      {error && <p className="mb-4 rounded-md bg-red-950 px-3 py-2 text-sm text-red-300">{error}</p>}

      {loading ? (
        <PenListSkeleton />
      ) : pens.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-700 p-10 text-center">
          <p className="text-neutral-400">{t('myPens.empty')}</p>
          <Link to="/pen" className="mt-3 inline-block text-indigo-400 hover:text-indigo-300">
            {t('myPens.createFirst')}
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {pens.map((pen) => (
            <li
              key={pen._id}
              className="flex items-center justify-between gap-3 rounded-lg border border-neutral-800 bg-neutral-900 p-4 hover:border-neutral-700"
            >
              <Link to={`/pen/${pen._id}`} className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-neutral-800 text-indigo-400">
                  <IconCode className="h-5 w-5" stroke={2} />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="truncate font-medium">{pen.title}</span>
                    {pen.isPublic ? (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-600/20 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                        <IconWorld className="h-3 w-3" stroke={2} />
                        {t('myPens.public')}
                      </span>
                    ) : (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] font-medium text-neutral-400">
                        <IconLock className="h-3 w-3" stroke={2} />
                        {t('myPens.private')}
                      </span>
                    )}
                  </span>
                  <span className="block text-xs text-neutral-500">{formatDate(pen.updatedAt)}</span>
                </span>
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(pen._id)}
                disabled={deletingId === pen._id}
                className="shrink-0 rounded-md p-2 text-neutral-400 hover:bg-neutral-800 hover:text-red-400 disabled:opacity-50"
                aria-label={t('myPens.deleteAria')}
              >
                <IconTrash className="h-4 w-4" stroke={1.75} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default MyPens
