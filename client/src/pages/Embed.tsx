import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import penService, { type SavedPen } from '@/services/pen.service'
import { useCompiledDoc } from '@/hooks/useCompiledDoc'

function Embed() {
  const { id } = useParams()
  const [pen, setPen] = useState<SavedPen | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let active = true
    penService.get(id).then((res) => {
      if (!active) return
      if (res.success) setPen(res.data.pen)
      else setError(res.error.message)
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
