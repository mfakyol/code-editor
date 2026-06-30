import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  IconHeart,
  IconHeartFilled,
  IconGitFork,
  IconPencil,
  IconCode,
  IconTrash,
  IconUser,
} from '@tabler/icons-react'
import { useAuth } from '@/contexts/AuthContext'
import { penApi, type SavedPen, type PenComment } from '@/config/api'
import { useCompiledDoc } from '@/hooks/useCompiledDoc'
import { Skeleton } from '@/components/Skeleton'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString()
}

function PenView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [pen, setPen] = useState<SavedPen | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [likedByMe, setLikedByMe] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [comments, setComments] = useState<PenComment[]>([])
  const [commentText, setCommentText] = useState('')
  const [posting, setPosting] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let active = true
    penApi
      .get(id)
      .then(({ pen, isOwner, likeCount, likedByMe }) => {
        if (!active) return
        setPen(pen)
        setIsOwner(isOwner)
        setLikeCount(likeCount)
        setLikedByMe(likedByMe)
      })
      .catch((err) => {
        if (active)
          setError(err instanceof Error ? err.message : 'Pen bulunamadı')
      })
    return () => {
      active = false
    }
  }, [id])

  useEffect(() => {
    if (!id) return
    let active = true
    penApi
      .comments(id)
      .then((res) => {
        if (active) setComments(res.comments)
      })
      .catch(() => {
        // Comments are non-critical; ignore load errors.
      })
    return () => {
      active = false
    }
  }, [id])

  const source = useMemo(
    () =>
      pen
        ? { html: pen.html, css: pen.css, js: pen.js, settings: pen.settings }
        : null,
    [pen],
  )
  const srcDoc = useCompiledDoc(source)

  const flashStatus = (message: string) => {
    setStatus(message)
    window.setTimeout(() => setStatus(null), 2500)
  }

  const handleLike = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    if (!id) return
    try {
      const { liked, likeCount: count } = await penApi.like(id)
      setLikedByMe(liked)
      setLikeCount(count)
    } catch (err) {
      flashStatus(err instanceof Error ? err.message : 'Beğenilemedi')
    }
  }

  const handleFork = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    if (!id) return
    try {
      const { pen: fork } = await penApi.fork(id)
      navigate(`/pen/${fork._id}`)
    } catch (err) {
      flashStatus(err instanceof Error ? err.message : 'Fork oluşturulamadı')
    }
  }

  const handleEmbed = async () => {
    if (!id) return
    const url = `${window.location.origin}/embed/${id}`
    const snippet = `<iframe src="${url}" style="width:100%;height:400px;border:0;" title="${pen?.title ?? 'Pen'}" loading="lazy"></iframe>`
    try {
      await navigator.clipboard.writeText(snippet)
      flashStatus('Embed kodu kopyalandı')
    } catch {
      window.prompt('Embed kodu:', snippet)
    }
  }

  const handleAddComment = async (event: FormEvent) => {
    event.preventDefault()
    const body = commentText.trim()
    if (!body || !id) return
    if (!user) {
      navigate('/login')
      return
    }
    setPosting(true)
    try {
      const { comment } = await penApi.addComment(id, body)
      setComments((current) => [comment, ...current])
      setCommentText('')
    } catch (err) {
      flashStatus(err instanceof Error ? err.message : 'Yorum eklenemedi')
    } finally {
      setPosting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!id) return
    try {
      await penApi.deleteComment(id, commentId)
      setComments((current) => current.filter((c) => c._id !== commentId))
    } catch (err) {
      flashStatus(err instanceof Error ? err.message : 'Silinemedi')
    }
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-neutral-400">
        {error}
      </div>
    )
  }

  if (!pen) {
    return (
      <div className="mx-auto h-full w-full max-w-5xl px-4 py-6 sm:px-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Skeleton className="h-7 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-16" />
            <Skeleton className="h-9 w-16" />
          </div>
        </div>
        <Skeleton className="h-[60vh] w-full rounded-lg" />
      </div>
    )
  }

  return (
    <div className="mx-auto h-full w-full max-w-5xl overflow-auto px-4 py-6 sm:px-6">
      {/* Meta + actions */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold sm:text-2xl">
            {pen.title}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {status && (
            <span className="text-xs text-neutral-400">{status}</span>
          )}
          <button
            type="button"
            onClick={handleLike}
            aria-pressed={likedByMe}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm ${
              likedByMe
                ? 'bg-rose-600/20 text-rose-400 hover:bg-rose-600/30'
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            {likedByMe ? (
              <IconHeartFilled className="h-4 w-4" />
            ) : (
              <IconHeart className="h-4 w-4" stroke={1.75} />
            )}
            {likeCount}
          </button>
          <button
            type="button"
            onClick={handleFork}
            className="inline-flex items-center gap-1.5 rounded-md bg-neutral-800 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-700"
          >
            <IconGitFork className="h-4 w-4" stroke={1.75} />
            Fork
          </button>
          <button
            type="button"
            onClick={handleEmbed}
            className="inline-flex items-center gap-1.5 rounded-md bg-neutral-800 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-700"
          >
            <IconCode className="h-4 w-4" stroke={1.75} />
            Embed
          </button>
          {isOwner && (
            <Link
              to={`/pen/${pen._id}`}
              className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium hover:bg-indigo-500"
            >
              <IconPencil className="h-4 w-4" stroke={1.75} />
              Düzenle
            </Link>
          )}
        </div>
      </div>

      {/* Live preview */}
      <div className="overflow-hidden rounded-lg border border-neutral-800 bg-white">
        <iframe
          srcDoc={srcDoc}
          sandbox="allow-scripts"
          title={pen.title}
          className="h-[60vh] w-full border-0 bg-white"
        />
      </div>

      {/* Comments */}
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">
          Yorumlar{' '}
          <span className="text-neutral-500">({comments.length})</span>
        </h2>

        <form onSubmit={handleAddComment} className="mb-5">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={
              user ? 'Bir yorum yaz...' : 'Yorum yapmak için giriş yap'
            }
            rows={3}
            maxLength={2000}
            className="w-full resize-y rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-indigo-500"
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={posting || !commentText.trim()}
              className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium hover:bg-indigo-500 disabled:opacity-50"
            >
              {posting ? 'Gönderiliyor...' : 'Yorum Yap'}
            </button>
          </div>
        </form>

        {comments.length === 0 ? (
          <p className="text-sm text-neutral-500">
            Henüz yorum yok. İlk yorumu sen yap!
          </p>
        ) : (
          <ul className="space-y-3">
            {comments.map((comment) => {
              const canDelete =
                isOwner || (user && user.id === comment.user._id)
              return (
                <li
                  key={comment._id}
                  className="rounded-md border border-neutral-800 bg-neutral-900 p-3"
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-sm font-medium text-neutral-200">
                      <IconUser className="h-3.5 w-3.5 text-neutral-500" stroke={2} />
                      <Link
                        to={`/u/${comment.user.username}`}
                        className="hover:text-indigo-400 hover:underline"
                      >
                        {comment.user.username}
                      </Link>
                      <span className="ml-1 text-xs font-normal text-neutral-500">
                        {formatDate(comment.createdAt)}
                      </span>
                    </span>
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(comment._id)}
                        aria-label="Yorumu sil"
                        className="rounded p-1 text-neutral-500 hover:bg-neutral-800 hover:text-red-400"
                      >
                        <IconTrash className="h-4 w-4" stroke={1.75} />
                      </button>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-neutral-300">
                    {comment.body}
                  </p>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

export default PenView
