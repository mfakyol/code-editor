import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconLayout,
  IconLayoutNavbar,
  IconLayoutSidebar,
  IconLayoutSidebarRight,
  IconPlayerPlayFilled,
  IconWand,
} from '@tabler/icons-react'
import AuthModal, { type AuthMode } from '@/components/AuthModal'
import { usePreviewRunner } from '@/contexts/PreviewRunnerContext'
import { useAuth } from '@/contexts/AuthContext'
import {
  useWorkspace,
  type ViewMode,
  type EditorTheme,
  MIN_FONT_SIZE,
  MAX_FONT_SIZE,
} from '@/contexts/WorkspaceContext'

const themeOptions: { value: EditorTheme; label: string }[] = [
  { value: 'dracula', label: 'Dracula' },
  { value: 'githubDark', label: 'GitHub Dark' },
  { value: 'githubLight', label: 'GitHub Light' },
]
import { penApi } from '@/config/api'
import { clearDraft } from '@/utils/draft'

const viewOptions: {
  mode: ViewMode
  label: string
  Icon: typeof IconLayout
}[] = [
  { mode: 'left', label: 'Sol', Icon: IconLayoutSidebar },
  { mode: 'top', label: 'Üst', Icon: IconLayoutNavbar },
  { mode: 'right', label: 'Sağ', Icon: IconLayoutSidebarRight },
]

function EditorHeader() {
  const { run } = usePreviewRunner()
  const { user, logout } = useAuth()
  const {
    title,
    setTitle,
    penId,
    setPenId,
    getSource,
    format,
    viewMode,
    setViewMode,
    markSaved,
    fontSize,
    adjustFontSize,
    autoRun,
    setAutoRun,
    editorTheme,
    setEditorTheme,
  } = useWorkspace()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [formatting, setFormatting] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [authMode, setAuthMode] = useState<AuthMode | null>(null)
  const [viewOpen, setViewOpen] = useState(false)
  const pendingSave = useRef(false)

  const doSave = async () => {
    const source = getSource()
    if (!source) return

    setSaving(true)
    setStatus(null)
    try {
      const payload = { title, ...source }
      if (penId) {
        await penApi.update(penId, payload)
      } else {
        const { pen } = await penApi.create(payload)
        setPenId(pen._id)
        clearDraft()
        navigate(`/pen/${pen._id}`)
      }
      markSaved()
      setStatus('Kaydedildi')
      window.setTimeout(() => setStatus(null), 2000)
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Kaydedilemedi')
    } finally {
      setSaving(false)
    }
  }

  const handleSave = () => {
    if (!user) {
      // Open the auth modal and resume saving once authenticated.
      pendingSave.current = true
      setAuthMode('login')
      return
    }
    void doSave()
  }

  const handleAuthenticated = () => {
    setAuthMode(null)
    if (pendingSave.current) {
      pendingSave.current = false
      void doSave()
    }
  }

  const handleCloseAuth = () => {
    pendingSave.current = false
    setAuthMode(null)
  }

  const handleFormat = async () => {
    setFormatting(true)
    setStatus(null)
    try {
      await format()
      setStatus('Biçimlendirildi')
      window.setTimeout(() => setStatus(null), 2000)
    } catch {
      setStatus('Biçimlendirilemedi')
    } finally {
      setFormatting(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  // Keyboard shortcuts: Ctrl/Cmd+S saves, Ctrl/Cmd+Enter runs, Shift+Alt+F formats.
  const saveRef = useRef(handleSave)
  saveRef.current = handleSave
  const runRef = useRef(run)
  runRef.current = run
  const formatRef = useRef(handleFormat)
  formatRef.current = handleFormat

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.shiftKey && event.altKey && event.key.toLowerCase() === 'f') {
        event.preventDefault()
        void formatRef.current()
        return
      }
      if (!event.ctrlKey && !event.metaKey) return
      const key = event.key.toLowerCase()
      if (key === 's') {
        event.preventDefault()
        saveRef.current()
      } else if (key === 'enter') {
        event.preventDefault()
        runRef.current({ force: true })
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <header className="flex items-center justify-between gap-2 border-b border-neutral-800 bg-neutral-950 px-3 py-2 sm:px-4">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-1 text-xs text-neutral-400 hover:text-neutral-100 sm:text-sm"
        >
          <IconArrowLeft className="h-4 w-4" stroke={1.75} />
          <span className="hidden sm:inline">Ana Sayfa</span>
        </Link>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled Pen"
          aria-label="Pen başlığı"
          className="min-w-0 max-w-[40vw] truncate rounded border border-transparent bg-transparent px-1.5 py-1 text-xs font-medium hover:border-neutral-700 focus:border-indigo-500 focus:outline-none sm:text-sm"
        />
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {status && (
          <span className="hidden text-xs text-neutral-400 sm:inline">
            {status}
          </span>
        )}

        <div className="hidden items-center rounded-md bg-neutral-800 sm:flex">
          <button
            type="button"
            onClick={() => adjustFontSize(-1)}
            disabled={fontSize <= MIN_FONT_SIZE}
            title="Yazı tipini küçült"
            aria-label="Yazı tipini küçült"
            className="px-2 py-1 text-sm text-neutral-300 hover:text-neutral-100 disabled:opacity-40"
          >
            A-
          </button>
          <span className="w-6 text-center text-xs text-neutral-400">
            {fontSize}
          </span>
          <button
            type="button"
            onClick={() => adjustFontSize(1)}
            disabled={fontSize >= MAX_FONT_SIZE}
            title="Yazı tipini büyüt"
            aria-label="Yazı tipini büyüt"
            className="px-2 py-1 text-base text-neutral-300 hover:text-neutral-100 disabled:opacity-40"
          >
            A+
          </button>
        </div>

        <label
          className="hidden cursor-pointer select-none items-center gap-1.5 text-xs text-neutral-400 sm:flex"
          title="Değişiklikte otomatik çalıştır"
        >
          <input
            type="checkbox"
            checked={autoRun}
            onChange={(e) => setAutoRun(e.target.checked)}
            className="accent-indigo-500"
          />
          Auto
        </label>

        <select
          value={editorTheme}
          onChange={(e) => setEditorTheme(e.target.value as EditorTheme)}
          title="Editör teması"
          aria-label="Editör teması"
          className="hidden rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-xs text-neutral-200 outline-none focus:border-indigo-500 sm:block"
        >
          {themeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="relative hidden sm:block">
          <button
            type="button"
            onClick={() => setViewOpen((open) => !open)}
            className="flex items-center rounded-md bg-neutral-800 px-2.5 py-1.5 text-neutral-200 hover:bg-neutral-700"
            aria-label="Görünümü değiştir"
            aria-haspopup="true"
            aria-expanded={viewOpen}
          >
            <IconLayout className="h-4 w-4" stroke={1.75} />
          </button>

          {viewOpen && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-40 cursor-default"
                aria-hidden="true"
                tabIndex={-1}
                onClick={() => setViewOpen(false)}
              />
              <div className="absolute right-0 z-50 mt-2 w-44 rounded-md border border-neutral-700 bg-neutral-900 p-2 shadow-xl">
                <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  Change View
                </p>
                <div className="flex gap-1">
                  {viewOptions.map(({ mode, label, Icon }) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => {
                        setViewMode(mode)
                        setViewOpen(false)
                      }}
                      title={label}
                      aria-label={label}
                      aria-pressed={viewMode === mode}
                      className={`flex flex-1 items-center justify-center rounded-md border py-2 ${
                        viewMode === mode
                          ? 'border-indigo-500 bg-neutral-800 text-indigo-400'
                          : 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                      }`}
                    >
                      <Icon className="h-5 w-5" stroke={1.75} />
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {user ? (
          <>
            <span className="hidden text-xs text-neutral-400 sm:inline">
              {user.username}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="hidden text-xs text-neutral-400 hover:text-neutral-100 sm:inline"
            >
              Çıkış
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setAuthMode('login')}
            className="text-xs text-neutral-400 hover:text-neutral-100 sm:text-sm"
          >
            Giriş
          </button>
        )}

        <button
          type="button"
          onClick={handleFormat}
          disabled={formatting}
          title="Biçimlendir (Shift + Alt + F)"
          aria-label="Biçimlendir"
          className="inline-flex items-center gap-1.5 rounded-md bg-neutral-800 px-2.5 py-1.5 text-xs text-neutral-200 hover:bg-neutral-700 disabled:opacity-50 sm:text-sm"
        >
          <IconWand className="h-4 w-4" stroke={1.75} />
          <span className="hidden sm:inline">
            {formatting ? '...' : 'Format'}
          </span>
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          title="Kaydet (Ctrl/Cmd + S)"
          className="inline-flex items-center gap-1.5 rounded-md bg-neutral-800 px-3 py-1.5 text-xs text-neutral-200 hover:bg-neutral-700 disabled:opacity-50 sm:text-sm"
        >
          <IconDeviceFloppy className="h-4 w-4" stroke={1.75} />
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>

        <button
          type="button"
          onClick={() => run({ force: true })}
          title="Çalıştır (Ctrl/Cmd + Enter)"
          className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-2.5 py-1.5 text-xs font-medium hover:bg-indigo-500 sm:px-3 sm:text-sm"
        >
          <IconPlayerPlayFilled className="h-4 w-4" />
          Run
        </button>
      </div>

      <AuthModal
        mode={authMode}
        onClose={handleCloseAuth}
        onAuthenticated={handleAuthenticated}
        onSwitchMode={setAuthMode}
      />
    </header>
  )
}

export default EditorHeader
