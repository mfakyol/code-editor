import { useEffect, useRef, useState } from 'react'
import { IconPlus, IconTrash, IconSearch, IconLoader2 } from '@tabler/icons-react'
import { searchCdn, type CdnLib } from '@/utils/cdn'
import { useI18n } from '@/stores/i18n.store'

type ResourceListProps = {
  label: string
  description: string
  placeholder: string
  emptyText: string
  items: string[]
  onChange: (items: string[]) => void
}

function ResourceList({ label, description, placeholder, emptyText, items, onChange }: ResourceListProps) {
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<CdnLib[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const add = (url: string) => onChange([...items, url])
  const update = (index: number, url: string) => onChange(items.map((item, i) => (i === index ? url : item)))
  const remove = (index: number) => onChange(items.filter((_, i) => i !== index))

  const requestId = useRef(0)
  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setResults([])
      setSearchError(null)
      setSearching(false)
      return
    }
    setSearching(true)
    const id = ++requestId.current
    const timeout = window.setTimeout(() => {
      searchCdn(q)
        .then((libs) => {
          if (id === requestId.current) {
            setResults(libs)
            setSearchError(null)
          }
        })
        .catch(() => {
          if (id === requestId.current) {
            setResults([])
            setSearchError(t('res.searchFailed'))
          }
        })
        .finally(() => {
          if (id === requestId.current) setSearching(false)
        })
    }, 350)
    return () => window.clearTimeout(timeout)
  }, [query])

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-neutral-300">{label}</label>
      <p className="mb-3 -mt-1 text-xs text-neutral-500">{description}</p>

      {}
      <div className="relative mb-3">
        <IconSearch className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('res.searchPlaceholder')}
          className="w-full rounded-md border border-neutral-700 bg-neutral-800 py-2 pl-8 pr-8 text-sm text-neutral-100 outline-none focus:border-indigo-500"
        />
        {searching && <IconLoader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-neutral-500" />}
      </div>

      {searchError && <p className="mb-3 text-xs text-red-400">{searchError}</p>}

      {results.length > 0 && (
        <ul className="mb-4 max-h-44 overflow-auto rounded-md border border-neutral-700 bg-neutral-950">
          {results.map((lib) => (
            <li key={lib.name}>
              <button
                type="button"
                onClick={() => {
                  add(lib.latest)
                  setQuery('')
                  setResults([])
                }}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-neutral-800"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm text-neutral-200">{lib.name}</span>
                  <span className="block truncate text-xs text-neutral-500">{lib.latest}</span>
                </span>
                <IconPlus className="h-4 w-4 shrink-0 text-indigo-400" stroke={2} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {items.length === 0 && <p className="mb-3 text-sm text-neutral-500">{emptyText}</p>}

      <div className="space-y-2">
        {items.map((value, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="url"
              value={value}
              onChange={(e) => update(index, e.target.value)}
              placeholder={placeholder}
              className="min-w-0 flex-1 rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={() => remove(index)}
              className="shrink-0 rounded-md p-2 text-neutral-400 hover:bg-neutral-800 hover:text-red-400"
              aria-label={t('res.removeAria')}
            >
              <IconTrash className="h-4 w-4" stroke={1.75} />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => add('')}
        className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-neutral-800 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-700"
      >
        <IconPlus className="h-4 w-4" stroke={2} />
        {t('res.addManually')}
      </button>
    </div>
  )
}

export default ResourceList
