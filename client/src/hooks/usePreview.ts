import { useCallback, useEffect, useRef, useState } from 'react'
import { buildErrorDoc } from '@/utils/buildErrorDoc'
import { buildSrcDoc } from '@/utils/buildSrcDoc'
import compileService from '@/services/compile.service'
import { usePreviewRunner } from '@/stores/preview-runner.store'
import type { PenSettings } from '@/types/preprocessors'

type PreviewSource = {
  html: string
  css: string
  js: string
  settings: PenSettings
  autoRun?: boolean
}

export type ConsoleLog = {
  id: number
  level: 'log' | 'warn' | 'error'
  message: string
}

type RunOptions = {
  force?: boolean
}

function buildFingerprint(source: { html: string; css: string; js: string }, settings: PenSettings): string {
  return JSON.stringify({ ...source, settings })
}

export function usePreview({ html, css, js, settings, autoRun = true }: PreviewSource) {
  const { registerRunner } = usePreviewRunner()
  const [srcDoc, setSrcDoc] = useState('')
  const [logs, setLogs] = useState<ConsoleLog[]>([])
  const [reloadNonce, setReloadNonce] = useState(0)
  const lastFingerprintRef = useRef<string | null>(null)
  const logIdRef = useRef(0)

  const clearLogs = useCallback(() => {
    setLogs([])
    logIdRef.current = 0
  }, [])

  const pushLog = useCallback((level: ConsoleLog['level'], message: string) => {
    setLogs((current) => [...current, { id: logIdRef.current++, level, message }])
  }, [])

  const run = useCallback(
    async (options?: RunOptions) => {
      const fingerprint = buildFingerprint({ html, css, js }, settings)
      const force = options?.force ?? false

      if (!force && fingerprint === lastFingerprintRef.current) {
        return
      }

      if (force && fingerprint === lastFingerprintRef.current) {
        setLogs([])
        logIdRef.current = 0
        setReloadNonce((nonce) => nonce + 1)
        return
      }

      lastFingerprintRef.current = fingerprint

      const compiled = await compileService.compileAll({ html, css, js }, settings)
      const nextSrcDoc =
        compiled.errors.length > 0
          ? buildErrorDoc(compiled.errors)
          : buildSrcDoc(compiled.html, compiled.css, compiled.js, {
              externalScripts: settings.externalScripts,
              externalStyles: settings.externalStyles,
            })

      setLogs([])
      logIdRef.current = 0
      setSrcDoc(nextSrcDoc)
      setReloadNonce((nonce) => nonce + 1)
    },
    [html, css, js, settings],
  )

  useEffect(() => {
    registerRunner(run)
  }, [registerRunner, run])

  useEffect(() => {
    if (!autoRun) return
    const timeoutId = window.setTimeout(() => {
      void run()
    }, 400)

    return () => window.clearTimeout(timeoutId)
  }, [html, css, js, settings, run, autoRun])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type !== 'preview-console') return

      const level = event.data.level as ConsoleLog['level']
      const message = String(event.data.message ?? '')

      setLogs((current) => [...current, { id: logIdRef.current++, level, message }])
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  return { srcDoc, logs, reloadNonce, run, clearLogs, pushLog }
}
