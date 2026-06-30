import { useRef, useState, type FormEvent } from 'react'
import {
  IconEye,
  IconTerminal2,
  IconMaximize,
  IconMinimize,
  IconTrash,
  IconChevronRight,
} from '@tabler/icons-react'
import type { ConsoleLog } from '@/hooks/usePreview'

type PreviewTab = 'result' | 'console'

type PreviewProps = {
  srcDoc: string
  logs: ConsoleLog[]
  reloadNonce: number
  clearLogs: () => void
  pushLog: (level: ConsoleLog['level'], message: string) => void
}

const logColors: Record<ConsoleLog['level'], string> = {
  log: 'text-neutral-300',
  warn: 'text-amber-400',
  error: 'text-red-400',
}

function Preview({
  srcDoc,
  logs,
  reloadNonce,
  clearLogs,
  pushLog,
}: PreviewProps) {
  const [activeTab, setActiveTab] = useState<PreviewTab>('result')
  const [maximized, setMaximized] = useState(false)
  const [command, setCommand] = useState('')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const toggleMaximized = () => setMaximized((value) => !value)

  const runCommand = (event: FormEvent) => {
    event.preventDefault()
    const code = command.trim()
    if (!code) return
    pushLog('log', `› ${code}`)
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'preview-eval', code },
      '*',
    )
    setCommand('')
  }

  return (
    <div
      className={
        maximized
          ? 'fixed inset-0 z-40 flex min-h-0 flex-col bg-neutral-950'
          : 'flex h-full min-h-0 flex-col bg-neutral-950'
      }
    >
      <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900 px-3 py-1.5">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('result')}
            className={`flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${
              activeTab === 'result'
                ? 'bg-neutral-800 text-emerald-400'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <IconEye className="h-3.5 w-3.5" stroke={2} />
            Result
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('console')}
            className={`flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${
              activeTab === 'console'
                ? 'bg-neutral-800 text-sky-400'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <IconTerminal2 className="h-3.5 w-3.5" stroke={2} />
            Console
            {logs.length > 0 && (
              <span className="ml-1 text-neutral-400">({logs.length})</span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-1">
          {activeTab === 'console' && logs.length > 0 && (
            <button
              type="button"
              onClick={clearLogs}
              title="Konsolu temizle"
              aria-label="Konsolu temizle"
              className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"
            >
              <IconTrash className="h-4 w-4" stroke={1.75} />
            </button>
          )}
          <button
            type="button"
            onClick={toggleMaximized}
            title={maximized ? 'Küçült' : 'Tam alan'}
            aria-label={maximized ? 'Küçült' : 'Tam alan'}
            className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"
          >
            {maximized ? (
              <IconMinimize className="h-4 w-4" stroke={1.75} />
            ) : (
              <IconMaximize className="h-4 w-4" stroke={1.75} />
            )}
          </button>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 bg-white">
        <iframe
          ref={iframeRef}
          key={`${reloadNonce}`}
          srcDoc={srcDoc}
          sandbox="allow-scripts"
          title="Preview"
          className={`absolute inset-0 h-full w-full border-0 bg-white ${
            activeTab === 'result' ? 'visible' : 'invisible'
          }`}
        />
        <div
          className={`absolute inset-0 flex h-full flex-col bg-neutral-950 font-mono text-sm ${
            activeTab === 'console' ? 'visible' : 'invisible'
          }`}
        >
          <div className="min-h-0 flex-1 overflow-auto p-3">
            {logs.length === 0 ? (
              <p className="text-neutral-500">
                Konsol çıktısı burada görünür. Aşağıdan komut çalıştırabilirsin.
              </p>
            ) : (
              <ul className="space-y-1">
                {logs.map((log) => (
                  <li key={log.id} className={logColors[log.level]}>
                    <span className="text-neutral-600">[{log.level}]</span>{' '}
                    {log.message}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <form
            onSubmit={runCommand}
            className="flex items-center gap-1.5 border-t border-neutral-800 px-3 py-2"
          >
            <IconChevronRight className="h-4 w-4 shrink-0 text-emerald-400" stroke={2} />
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="JS komutu çalıştır..."
              spellCheck={false}
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent text-neutral-200 outline-none placeholder:text-neutral-600"
            />
          </form>
        </div>
      </div>
    </div>
  )
}

export default Preview
