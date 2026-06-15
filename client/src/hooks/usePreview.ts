import { useCallback, useEffect, useRef, useState } from 'react'
import { buildErrorDoc } from '@/utils/buildErrorDoc'
import { buildSrcDoc } from '@/utils/buildSrcDoc'
import { compileAll } from '@/utils/compileCode'
import { usePreviewRunner } from '@/contexts/PreviewRunnerContext'
import type { PenSettings } from '@/types/preprocessors'

type PreviewSource = {
  html: string
  css: string
  js: string
  settings: PenSettings
}

export type ConsoleLog = {
  id: number
  level: 'log' | 'warn' | 'error'
  message: string
}

type RunOptions = {
  force?: boolean
}

function buildFingerprint(
  source: { html: string; css: string; js: string },
  settings: PenSettings,
): string {
  return JSON.stringify({ ...source, settings })
}

export function usePreview({ html, css, js, settings }: PreviewSource) {
  const { registerRunner } = usePreviewRunner()
  const [srcDoc, setSrcDoc] = useState('')
  const [logs, setLogs] = useState<ConsoleLog[]>([])
  const [reloadNonce, setReloadNonce] = useState(0)
  const lastFingerprintRef = useRef<string | null>(null)
  const logIdRef = useRef(0)

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

      const compiled = await compileAll({ html, css, js }, settings)
      const nextSrcDoc =
        compiled.errors.length > 0
          ? buildErrorDoc(compiled.errors)
          : buildSrcDoc(compiled.html, compiled.css, compiled.js)

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
    const timeoutId = window.setTimeout(() => {
      void run()
    }, 400)

    return () => window.clearTimeout(timeoutId)
  }, [html, css, js, settings, run])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type !== 'preview-console') return

      const level = event.data.level as ConsoleLog['level']
      const message = String(event.data.message ?? '')

      setLogs((current) => [
        ...current,
        { id: logIdRef.current++, level, message },
      ])
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  return { srcDoc, logs, reloadNonce, run }
}
