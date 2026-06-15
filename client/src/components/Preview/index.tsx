import { useState } from 'react'
import type { ConsoleLog } from '@/hooks/usePreview'

type PreviewTab = 'result' | 'console'

type PreviewProps = {
  srcDoc: string
  logs: ConsoleLog[]
  reloadNonce: number
}

const logColors: Record<ConsoleLog['level'], string> = {
  log: 'text-neutral-300',
  warn: 'text-amber-400',
  error: 'text-red-400',
}

function Preview({ srcDoc, logs, reloadNonce }: PreviewProps) {
  const [activeTab, setActiveTab] = useState<PreviewTab>('result')

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900 px-3 py-1.5">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('result')}
            className={`rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${
              activeTab === 'result'
                ? 'bg-neutral-800 text-emerald-400'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Result
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('console')}
            className={`rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${
              activeTab === 'console'
                ? 'bg-neutral-800 text-sky-400'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Console
            {logs.length > 0 && (
              <span className="ml-1 text-neutral-400">({logs.length})</span>
            )}
          </button>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 bg-white">
        <iframe
          key={`${reloadNonce}`}
          srcDoc={srcDoc}
          sandbox="allow-scripts"
          title="Preview"
          className={`absolute inset-0 h-full w-full border-0 bg-white ${
            activeTab === 'result' ? 'visible' : 'invisible'
          }`}
        />
        <div
          className={`absolute inset-0 h-full overflow-auto bg-neutral-950 p-3 font-mono text-sm ${
            activeTab === 'console' ? 'visible' : 'invisible'
          }`}
        >
          {logs.length === 0 ? (
            <p className="text-neutral-500">Console output will appear here.</p>
          ) : (
            <ul className="space-y-1">
              {logs.map((log) => (
                <li key={log.id} className={logColors[log.level]}>
                  <span className="text-neutral-600">[{log.level}]</span> {log.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default Preview
