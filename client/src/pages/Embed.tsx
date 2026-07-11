import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import penService, { type SavedPen } from '@/services/pen.service'
import { useCompiledDoc } from '@/hooks/useCompiledDoc'
import { useI18n } from '@/stores/i18n.store'

function Embed() {
  const { id } = useParams()
  const { t } = useI18n()
  const [pen, setPen] = useState<SavedPen | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let active = true
    penService
      .get(id)
      .then(({ pen }) => {
        if (active) setPen(pen)
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : t('embed.notFound'))
      })
    return () => {
      active = false
    }
  }, [id])

  const source = useMemo(
    () => (pen ? { html: pen.html, css: pen.css, js: pen.js, settings: pen.settings } : null),
    [pen],
  )
  const srcDoc = useCompiledDoc(source)

  if (error) {
    return <div className="flex h-screen items-center justify-center bg-neutral-950 text-neutral-400">{error}</div>
  }

  return (
    <iframe
      srcDoc={srcDoc}
      sandbox="allow-scripts"
      title={pen?.title ?? 'Pen'}
      className="h-screen w-screen border-0 bg-white"
    />
  )
}

export default Embed
