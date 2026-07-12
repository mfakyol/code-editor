import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconGitFork, IconHeart, IconHeartFilled, IconLink, IconLock, IconWand, IconWorld } from '@tabler/icons-react'
import ToolbarButton from '@/components/editor/ToolbarButton'
import { useI18n } from '@/stores/i18n.store'
import { useWorkspaceStore } from '@/stores/workspace.store'
import { useAuthStore } from '@/stores/auth.store'
import { useEditorStore } from '@/stores/editor.store'
import { notify } from '@/stores/notification.store'
import penService from '@/services/pen.service'
import socialService from '@/services/social.service'

const ICON = 'h-4 w-4 shrink-0'

function EditorActions() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const penId = useWorkspaceStore((s) => s.penId)
  const isOwner = useWorkspaceStore((s) => s.isOwner)
  const isPublic = useWorkspaceStore((s) => s.isPublic)
  const likeCount = useWorkspaceStore((s) => s.likeCount)
  const likedByMe = useWorkspaceStore((s) => s.likedByMe)
  const user = useAuthStore((s) => s.user)

  const [formatting, setFormatting] = useState(false)
  const [forking, setForking] = useState(false)
  const [togglingPublic, setTogglingPublic] = useState(false)
  const [liking, setLiking] = useState(false)

  const handleFormat = useCallback(async () => {
    setFormatting(true)
    try {
      await useWorkspaceStore.getState().format()
    } catch {
      notify.error(t('editor.status.formatFailed'))
    } finally {
      setFormatting(false)
    }
  }, [t])

  const handleTogglePublic = useCallback(async () => {
    const ws = useWorkspaceStore.getState()
    const nextValue = !ws.isPublic

    if (!ws.penId) {
      ws.setIsPublic(nextValue)
      return
    }

    setTogglingPublic(true)
    const res = await penService.setVisibility(ws.penId, nextValue)
    setTogglingPublic(false)

    if (res.success) {
      ws.setIsPublic(res.data.isPublic)
    } else {
      notify.error(res.error.message)
    }
  }, [])

  const doLike = useCallback(async () => {
    const ws = useWorkspaceStore.getState()
    if (!ws.penId) return
    setLiking(true)
    const res = await socialService.like(ws.penId)
    setLiking(false)
    if (res.success) {
      ws.setSocial({ likeCount: res.data.likeCount, likedByMe: res.data.liked, commentCount: ws.commentCount })
    } else {
      notify.error(res.error.message)
    }
  }, [])

  const handleLike = useCallback(() => {
    if (!useAuthStore.getState().user) {
      useEditorStore.setState({ authMode: 'login', pendingAction: doLike })
      return
    }
    void doLike()
  }, [doLike])

  const handleCopyLink = useCallback(async () => {
    const ws = useWorkspaceStore.getState()
    if (!ws.penId) {
      notify.warning(t('editor.status.saveFirst'))
      return
    }
    const url = `${window.location.origin}/pen/${ws.penId}`
    try {
      await navigator.clipboard.writeText(url)
      if (ws.isPublic) {
        notify.success(t('editor.status.linkCopied'))
      } else {
        notify.warning(t('editor.status.privateLinkCopied'))
      }
    } catch {
      window.prompt(t('editor.status.sharePrompt'), url)
    }
  }, [t])

  const doFork = useCallback(async () => {
    const ws = useWorkspaceStore.getState()
    const source = ws.getSource()
    if (!source) return
    setForking(true)
    const forkTitle = `${ws.title} (fork)`
    const res = await penService.create({ title: forkTitle, isPublic: false, ...source })
    setForking(false)
    if (!res.success) {
      notify.error(res.error.message)
      return
    }
    ws.setPenId(res.data.pen._id)
    ws.setIsOwner(true)
    ws.setIsPublic(false)
    ws.setTitle(forkTitle)
    ws.markSaved()
    navigate(`/pen/${res.data.pen._id}`)
  }, [navigate, t])

  const handleFork = useCallback(() => {
    if (!useAuthStore.getState().user) {
      useEditorStore.setState({ authMode: 'login', pendingAction: doFork })
      return
    }
    void doFork()
  }, [doFork])

  const handleFormatRef = useRef(handleFormat)
  handleFormatRef.current = handleFormat

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.shiftKey && event.altKey && event.key.toLowerCase() === 'f') {
        event.preventDefault()
        void handleFormatRef.current()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="flex flex-col gap-2">
      <ToolbarButton
        menu
        icon={<IconWand className={ICON} stroke={1.75} />}
        onClick={handleFormat}
        loading={formatting}
        title={t('editor.formatTitle')}
        aria-label={t('editor.formatAria')}
      >
        {t('editor.format')}
      </ToolbarButton>

      {user && isOwner && (
        <ToolbarButton
          menu
          variant={isPublic ? 'success' : 'neutral'}
          icon={isPublic ? <IconWorld className={ICON} stroke={1.75} /> : <IconLock className={ICON} stroke={1.75} />}
          onClick={handleTogglePublic}
          loading={togglingPublic}
          title={isPublic ? t('editor.publicTitle') : t('editor.privateTitle')}
          aria-label={t('editor.visibilityAria')}
          aria-pressed={isPublic}
        >
          {isPublic ? t('editor.public') : t('editor.private')}
        </ToolbarButton>
      )}

      {penId && !isOwner && (
        <ToolbarButton
          menu
          variant={likedByMe ? 'like' : 'neutral'}
          icon={likedByMe ? <IconHeartFilled className={ICON} /> : <IconHeart className={ICON} stroke={1.75} />}
          onClick={handleLike}
          loading={liking}
          title={likedByMe ? t('editor.unlike') : t('editor.like')}
          aria-label={t('editor.like')}
          aria-pressed={likedByMe}
        >
          {t('editor.like')}
          {likeCount > 0 ? ` (${likeCount})` : ''}
        </ToolbarButton>
      )}

      {penId && (
        <ToolbarButton
          menu
          icon={<IconLink className={ICON} stroke={1.75} />}
          onClick={handleCopyLink}
          title={t('editor.copyLink')}
          aria-label={t('editor.copyLink')}
        >
          {t('editor.copyLink')}
        </ToolbarButton>
      )}

      {penId && (
        <ToolbarButton
          menu
          icon={<IconGitFork className={ICON} stroke={1.75} />}
          onClick={handleFork}
          loading={forking}
          title={t('editor.forkTitle')}
          aria-label={t('editor.fork')}
        >
          {t('editor.fork')}
        </ToolbarButton>
      )}
    </div>
  )
}

export default EditorActions
