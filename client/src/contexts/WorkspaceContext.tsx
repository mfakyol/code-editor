import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { PenSettings } from '@/types/preprocessors'

export type PenSource = {
  html: string
  css: string
  js: string
  settings: PenSettings
}

// Editor layout (web only): editors on top / left / right of the preview.
export type ViewMode = 'top' | 'left' | 'right'

export type EditorTheme = 'dracula' | 'githubDark' | 'githubLight'

type SourceGetter = () => PenSource
type Formatter = () => Promise<void>

type WorkspaceContextValue = {
  title: string
  setTitle: (title: string) => void
  penId: string | null
  setPenId: (id: string | null) => void
  isPublic: boolean
  setIsPublic: (value: boolean) => void
  isOwner: boolean
  setIsOwner: (value: boolean) => void
  likeCount: number
  likedByMe: boolean
  commentCount: number
  setSocial: (state: {
    likeCount: number
    likedByMe: boolean
    commentCount: number
  }) => void
  registerSource: (getter: SourceGetter) => void
  getSource: () => PenSource | null
  registerFormatter: (formatter: Formatter) => void
  format: () => Promise<void>
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  savedTick: number
  markSaved: () => void
  fontSize: number
  adjustFontSize: (delta: number) => void
  autoRun: boolean
  setAutoRun: (value: boolean) => void
  editorTheme: EditorTheme
  setEditorTheme: (theme: EditorTheme) => void
}

const EDITOR_THEMES: EditorTheme[] = ['dracula', 'githubDark', 'githubLight']

export const MIN_FONT_SIZE = 10
export const MAX_FONT_SIZE = 28

function readStored<T>(key: string, fallback: T, parse: (raw: string) => T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : parse(raw)
  } catch {
    return fallback
  }
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState('Untitled Pen')
  const [penId, setPenId] = useState<string | null>(null)
  // A brand-new (unsaved) pen belongs to whoever saves it, so default to owner.
  const [isPublic, setIsPublic] = useState(false)
  const [isOwner, setIsOwner] = useState(true)
  const [likeCount, setLikeCount] = useState(0)
  const [likedByMe, setLikedByMe] = useState(false)
  const [commentCount, setCommentCount] = useState(0)

  const setSocial = useCallback(
    (state: { likeCount: number; likedByMe: boolean; commentCount: number }) => {
      setLikeCount(state.likeCount)
      setLikedByMe(state.likedByMe)
      setCommentCount(state.commentCount)
    },
    [],
  )
  const [viewMode, setViewModeState] = useState<ViewMode>(() =>
    readStored<ViewMode>('codeeditor:viewMode', 'top', (raw) =>
      raw === 'left' || raw === 'right' ? raw : 'top',
    ),
  )
  const [fontSize, setFontSizeState] = useState<number>(() =>
    readStored('codeeditor:fontSize', 14, (raw) => {
      const n = Number(raw)
      return n >= MIN_FONT_SIZE && n <= MAX_FONT_SIZE ? n : 14
    }),
  )
  const [autoRun, setAutoRunState] = useState<boolean>(() =>
    readStored('codeeditor:autoRun', true, (raw) => raw !== 'false'),
  )
  const [editorTheme, setEditorThemeState] = useState<EditorTheme>(() =>
    readStored<EditorTheme>('codeeditor:editorTheme', 'dracula', (raw) =>
      EDITOR_THEMES.includes(raw as EditorTheme)
        ? (raw as EditorTheme)
        : 'dracula',
    ),
  )
  const [savedTick, setSavedTick] = useState(0)
  const sourceRef = useRef<SourceGetter | null>(null)

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode)
    try {
      localStorage.setItem('codeeditor:viewMode', mode)
    } catch {
      // ignore
    }
  }, [])

  const adjustFontSize = useCallback((delta: number) => {
    setFontSizeState((prev) => {
      const clamped = Math.min(
        MAX_FONT_SIZE,
        Math.max(MIN_FONT_SIZE, prev + delta),
      )
      try {
        localStorage.setItem('codeeditor:fontSize', String(clamped))
      } catch {
        // ignore
      }
      return clamped
    })
  }, [])

  const setAutoRun = useCallback((value: boolean) => {
    setAutoRunState(value)
    try {
      localStorage.setItem('codeeditor:autoRun', String(value))
    } catch {
      // ignore
    }
  }, [])

  const setEditorTheme = useCallback((theme: EditorTheme) => {
    setEditorThemeState(theme)
    try {
      localStorage.setItem('codeeditor:editorTheme', theme)
    } catch {
      // ignore
    }
  }, [])
  const formatterRef = useRef<Formatter | null>(null)

  const registerSource = useCallback((getter: SourceGetter) => {
    sourceRef.current = getter
  }, [])

  const getSource = useCallback(() => sourceRef.current?.() ?? null, [])

  const registerFormatter = useCallback((formatter: Formatter) => {
    formatterRef.current = formatter
  }, [])

  const format = useCallback(async () => {
    await formatterRef.current?.()
  }, [])

  const markSaved = useCallback(() => setSavedTick((tick) => tick + 1), [])

  return (
    <WorkspaceContext.Provider
      value={{
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
        registerSource,
        getSource,
        registerFormatter,
        format,
        viewMode,
        setViewMode,
        savedTick,
        markSaved,
        fontSize,
        adjustFontSize,
        autoRun,
        setAutoRun,
        editorTheme,
        setEditorTheme,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (!context) {
    throw new Error('useWorkspace must be used within WorkspaceProvider')
  }
  return context
}
