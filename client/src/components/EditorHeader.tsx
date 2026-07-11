import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconEye,
  IconGitFork,
  IconHeart,
  IconHeartFilled,
  IconLayout,
  IconLayoutNavbar,
  IconLayoutSidebar,
  IconLayoutSidebarRight,
  IconLock,
  IconPlayerPlayFilled,
  IconShare,
  IconWand,
  IconWorld,
} from '@tabler/icons-react'
import AuthModal, { type AuthMode } from '@/components/AuthModal'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { usePreviewRunner } from '@/stores/preview-runner.store'
import { useAuthStore } from '@/stores/auth.store'
import authService from '@/services/auth.service'
import { useI18n } from '@/stores/i18n.store'
import { useWorkspace, type ViewMode, type EditorTheme, MIN_FONT_SIZE, MAX_FONT_SIZE } from '@/stores/workspace.store'

const themeOptions: { value: EditorTheme; label: string }[] = [
  { value: 'dracula', label: 'Dracula' },
  { value: 'githubDark', label: 'GitHub Dark' },
  { value: 'githubLight', label: 'GitHub Light' },
]
import penService from '@/services/pen.service'
import socialService from '@/services/social.service'
import { clearDraft } from '@/utils/draft'

const viewOptions: {
  mode: ViewMode
  labelKey: string
  Icon: typeof IconLayout
}[] = [
  { mode: 'left', labelKey: 'editor.view.left', Icon: IconLayoutSidebar },
  { mode: 'top', labelKey: 'editor.view.top', Icon: IconLayoutNavbar },
  { mode: 'right', labelKey: 'editor.view.right', Icon: IconLayoutSidebarRight },
]

function EditorHeader() {
  const { run } = usePreviewRunner()
  const user = useAuthStore((s) => s.user)
  const { t } = useI18n()
  const {
    title,
    setTitle,
    penId,
    setPenId,
    isPublic,
    setIsPublic,
    isOwner,
    setIsOwner,
    likeCount,
    likedByMe,
    commentCount,
    setSocial,
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
  const [forking, setForking] = useState(false)
  const [formatting, setFormatting] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [authMode, setAuthMode] = useState<AuthMode | null>(null)
  const [viewOpen, setViewOpen] = useState(false)
  const pendingSave = useRef(false)
  const pendingFork = useRef(false)
  const pendingLike = useRef(false)

  const flashStatus = (message: string) => {
    setStatus(message)
    window.setTimeout(() => setStatus(null), 2000)
  }

  const doSave = async () => {
    const source = getSource()
    if (!source) return

    setSaving(true)
    setStatus(null)
    try {
      const payload = { title, isPublic, ...source }
      if (penId) {
        await penService.update(penId, payload)
      } else {
        const { pen } = await penService.create(payload)
        setPenId(pen._id)
        setIsOwner(true)
        clearDraft()
        navigate(`/pen/${pen._id}`)
      }
      markSaved()
      flashStatus(t('editor.status.saved'))
    } catch (err) {
      setStatus(err instanceof Error ? err.message : t('editor.status.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  const doFork = async () => {
    const source = getSource()
    if (!source) return
    setForking(true)
    setStatus(null)
    try {
      const forkTitle = `${title} (fork)`
      const { pen } = await penService.create({
        title: forkTitle,
        isPublic: false,
        ...source,
      })
      setPenId(pen._id)
      setIsOwner(true)
      setIsPublic(false)
      setTitle(forkTitle)
      markSaved()
      navigate(`/pen/${pen._id}`)
      flashStatus(t('editor.status.forked'))
    } catch (err) {
      setStatus(err instanceof Error ? err.message : t('editor.status.forkFailed'))
    } finally {
      setForking(false)
    }
  }

  const handleFork = () => {
    if (!user) {
      pendingFork.current = true
      setAuthMode('login')
      return
    }
    void doFork()
  }

  const doLike = async () => {
    if (!penId) return
    try {
      const { liked, likeCount: count } = await socialService.like(penId)
      setSocial({ likeCount: count, likedByMe: liked, commentCount })
    } catch (err) {
      setStatus(err instanceof Error ? err.message : t('editor.status.likeFailed'))
    }
  }

  const handleLike = () => {
    if (!user) {
      pendingLike.current = true
      setAuthMode('login')
      return
    }
    void doLike()
  }

  const handleShare = async () => {
    if (!penId) {
      flashStatus(t('editor.status.saveFirst'))
      return
    }
    const url = `${window.location.origin}/pen/${penId}`
    try {
      await navigator.clipboard.writeText(url)
      flashStatus(isPublic ? t('editor.status.linkCopied') : t('editor.status.privateLinkCopied'))
    } catch {
      window.prompt(t('editor.status.sharePrompt'), url)
    }
  }

  const handleTogglePublic = async () => {
    const nextValue = !isPublic
    setIsPublic(nextValue)

    if (penId) {
      try {
        await penService.setVisibility(penId, nextValue)
        flashStatus(nextValue ? t('editor.status.madePublic') : t('editor.status.madePrivate'))
      } catch (err) {
        setIsPublic(!nextValue)
        setStatus(err instanceof Error ? err.message : t('editor.status.updateFailed'))
      }
    }
  }

  const handleSave = () => {
    if (penId && !isOwner) {
      flashStatus(t('editor.status.notYours'))
      return
    }
    if (!user) {
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
    if (pendingFork.current) {
      pendingFork.current = false
      void doFork()
    }
    if (pendingLike.current) {
      pendingLike.current = false
      void doLike()
    }
  }

  const handleCloseAuth = () => {
    pendingSave.current = false
    pendingFork.current = false
    pendingLike.current = false
    setAuthMode(null)
  }

  const handleFormat = async () => {
    setFormatting(true)
    setStatus(null)
    try {
      await format()
      setStatus(t('editor.status.formatted'))
      window.setTimeout(() => setStatus(null), 2000)
    } catch {
      setStatus(t('editor.status.formatFailed'))
    } finally {
      setFormatting(false)
    }
  }

  const handleLogout = async () => {
    await authService.logout()
    navigate('/')
  }

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
          <span className="hidden sm:inline">{t('editor.home')}</span>
        </Link>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('editor.titlePlaceholder')}
          aria-label={t('editor.titleAria')}
          readOnly={Boolean(penId) && !isOwner}
          className="min-w-0 max-w-[40vw] truncate rounded border border-transparent bg-transparent px-1.5 py-1 text-xs font-medium hover:border-neutral-700 focus:border-indigo-500 focus:outline-none sm:text-sm"
        />
        {penId && !isOwner && (
          <span
            title={t('editor.readonlyTitle')}
            className="hidden shrink-0 items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-400 sm:inline-flex"
          >
            <IconEye className="h-3 w-3" stroke={2} />
            {t('editor.readonly')}
          </span>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {status && <span className="hidden text-xs text-neutral-400 sm:inline">{status}</span>}

        <div className="hidden items-center rounded-md bg-neutral-800 sm:flex">
          <button
            type="button"
            onClick={() => adjustFontSize(-1)}
            disabled={fontSize <= MIN_FONT_SIZE}
            title={t('editor.fontDown')}
            aria-label={t('editor.fontDown')}
            className="px-2 py-1 text-sm text-neutral-300 hover:text-neutral-100 disabled:opacity-40"
          >
            A-
          </button>
          <span className="w-6 text-center text-xs text-neutral-400">{fontSize}</span>
          <button
            type="button"
            onClick={() => adjustFontSize(1)}
            disabled={fontSize >= MAX_FONT_SIZE}
            title={t('editor.fontUp')}
            aria-label={t('editor.fontUp')}
            className="px-2 py-1 text-base text-neutral-300 hover:text-neutral-100 disabled:opacity-40"
          >
            A+
          </button>
        </div>

        <label
          className="hidden cursor-pointer select-none items-center gap-1.5 text-xs text-neutral-400 sm:flex"
          title={t('editor.autoRunTitle')}
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
          title={t('editor.theme')}
          aria-label={t('editor.theme')}
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
            aria-label={t('editor.changeViewAria')}
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
                  {t('editor.changeView')}
                </p>
                <div className="flex gap-1">
                  {viewOptions.map(({ mode, labelKey, Icon }) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => {
                        setViewMode(mode)
                        setViewOpen(false)
                      }}
                      title={t(labelKey)}
                      aria-label={t(labelKey)}
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

        <div className="hidden sm:block">
          <LanguageSwitcher compact />
        </div>

        {user ? (
          <>
            <span className="hidden text-xs text-neutral-400 sm:inline">{user.username}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="hidden text-xs text-neutral-400 hover:text-neutral-100 sm:inline"
            >
              {t('editor.logout')}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setAuthMode('login')}
            className="text-xs text-neutral-400 hover:text-neutral-100 sm:text-sm"
          >
            {t('editor.login')}
          </button>
        )}

        <button
          type="button"
          onClick={handleFormat}
          disabled={formatting}
          title={t('editor.formatTitle')}
          aria-label={t('editor.formatAria')}
          className="inline-flex items-center gap-1.5 rounded-md bg-neutral-800 px-2.5 py-1.5 text-xs text-neutral-200 hover:bg-neutral-700 disabled:opacity-50 sm:text-sm"
        >
          <IconWand className="h-4 w-4" stroke={1.75} />
          <span className="hidden sm:inline">{formatting ? '...' : t('editor.format')}</span>
        </button>

        {isOwner && (
          <button
            type="button"
            onClick={handleTogglePublic}
            title={isPublic ? t('editor.publicTitle') : t('editor.privateTitle')}
            aria-label={t('editor.visibilityAria')}
            aria-pressed={isPublic}
            className={`hidden items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs sm:inline-flex sm:text-sm ${
              isPublic
                ? 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30'
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            {isPublic ? (
              <IconWorld className="h-4 w-4" stroke={1.75} />
            ) : (
              <IconLock className="h-4 w-4" stroke={1.75} />
            )}
            <span className="hidden md:inline">{isPublic ? t('editor.public') : t('editor.private')}</span>
          </button>
        )}

        {penId && (
          <button
            type="button"
            onClick={handleLike}
            title={likedByMe ? t('editor.unlike') : t('editor.like')}
            aria-label={t('editor.like')}
            aria-pressed={likedByMe}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs sm:text-sm ${
              likedByMe
                ? 'bg-rose-600/20 text-rose-400 hover:bg-rose-600/30'
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            {likedByMe ? <IconHeartFilled className="h-4 w-4" /> : <IconHeart className="h-4 w-4" stroke={1.75} />}
            {likeCount > 0 && <span>{likeCount}</span>}
          </button>
        )}

        {penId && (
          <button
            type="button"
            onClick={handleShare}
            title={t('editor.shareTitle')}
            aria-label={t('editor.share')}
            className="inline-flex items-center gap-1.5 rounded-md bg-neutral-800 px-2.5 py-1.5 text-xs text-neutral-200 hover:bg-neutral-700 sm:text-sm"
          >
            <IconShare className="h-4 w-4" stroke={1.75} />
            <span className="hidden sm:inline">{t('editor.share')}</span>
          </button>
        )}

        {penId && (
          <button
            type="button"
            onClick={handleFork}
            disabled={forking}
            title={t('editor.forkTitle')}
            aria-label={t('editor.fork')}
            className="inline-flex items-center gap-1.5 rounded-md bg-neutral-800 px-2.5 py-1.5 text-xs text-neutral-200 hover:bg-neutral-700 disabled:opacity-50 sm:text-sm"
          >
            <IconGitFork className="h-4 w-4" stroke={1.75} />
            <span className="hidden sm:inline">{forking ? '...' : t('editor.fork')}</span>
          </button>
        )}

        {isOwner && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            title={t('editor.saveTitle')}
            className="inline-flex items-center gap-1.5 rounded-md bg-neutral-800 px-3 py-1.5 text-xs text-neutral-200 hover:bg-neutral-700 disabled:opacity-50 sm:text-sm"
          >
            <IconDeviceFloppy className="h-4 w-4" stroke={1.75} />
            {saving ? t('editor.saving') : t('editor.save')}
          </button>
        )}

        <button
          type="button"
          onClick={() => run({ force: true })}
          title={t('editor.runTitle')}
          className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-2.5 py-1.5 text-xs font-medium hover:bg-indigo-500 sm:px-3 sm:text-sm"
        >
          <IconPlayerPlayFilled className="h-4 w-4" />
          {t('editor.run')}
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
