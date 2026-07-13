import { useEffect, useState } from 'react'
import { compileToSrcDoc, type CompileSource } from '@/services/compile.service'

export function useCompiledDoc(source: CompileSource | null): string {
  const [srcDoc, setSrcDoc] = useState('')

  useEffect(() => {
    if (!source) {
      setSrcDoc('')
      return
    }

    let active = true
    compileToSrcDoc(source).then((doc) => {
      if (active) setSrcDoc(doc)
    })
    return () => {
      active = false
    }
  }, [source])

  return srcDoc
}
