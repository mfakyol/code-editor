import { useEffect, useState } from 'react'
import { buildErrorDoc } from '@/utils/buildErrorDoc'
import { buildSrcDoc } from '@/utils/buildSrcDoc'
import { compileAll } from '@/utils/compileCode'
import type { PenSettings } from '@/types/preprocessors'

type Source = {
  html: string
  css: string
  js: string
  settings: PenSettings
} | null

// Compiles a pen's source (running preprocessors through the server when
// needed) and returns a ready-to-render iframe srcDoc. Used by the read-only
// full and embed views.
export function useCompiledDoc(source: Source): string {
  const [srcDoc, setSrcDoc] = useState('')

  useEffect(() => {
    if (!source) {
      setSrcDoc('')
      return
    }

    let active = true
    const { html, css, js, settings } = source
    compileAll({ html, css, js }, settings).then((compiled) => {
      if (!active) return
      setSrcDoc(
        compiled.errors.length > 0
          ? buildErrorDoc(compiled.errors)
          : buildSrcDoc(compiled.html, compiled.css, compiled.js, {
              externalScripts: settings.externalScripts,
              externalStyles: settings.externalStyles,
            }),
      )
    })
    return () => {
      active = false
    }
  }, [source])

  return srcDoc
}
