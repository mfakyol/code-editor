import { create } from 'zustand'
import { defaultPenSettings, type PenSettings } from '@/types/preprocessors'
import { usePenSettings } from '@/stores/pen-settings.store'
import { formatCode } from '@/utils/formatCode'

export type PenSource = {
  html: string
  css: string
  js: string
  settings: PenSettings
}

type Code = { html: string; css: string; js: string }

type WorkspaceState = {
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
  setSocial: (state: { likeCount: number; likedByMe: boolean; commentCount: number }) => void
  loadedKey: string
  setLoadedKey: (key: string) => void
  html: string
  css: string
  js: string
  setHtml: (html: string) => void
  setCss: (css: string) => void
  setJs: (js: string) => void
  setCode: (code: Code) => void
  getSource: () => PenSource
  format: () => Promise<void>
  baseline: string
  dirty: boolean
  markSaved: () => void
  recomputeDirty: () => void
}

export const DEFAULT_TITLE = 'Untitled Pen'

export const DEFAULT_HTML = `<div class="container">
  <h1>Hello World</h1>
  <p>Edit HTML, CSS and JS to see live output.</p>
</div>`

export const DEFAULT_CSS = `body {
  font-family: system-ui, sans-serif;
  padding: 1.5rem;
  background: #0f172a;
  color: #e2e8f0;
}

.container h1 {
  color: #818cf8;
  margin-bottom: 0.5rem;
}`

export const DEFAULT_JS = `console.log('Hello from JS');
document.querySelector('p')?.addEventListener('click', () => {
  console.warn('Paragraph clicked!');
});`

function fingerprint(title: string, source: PenSource): string {
  return JSON.stringify({ title, ...source })
}

function sourceOf(s: Code): PenSource {
  return { html: s.html, css: s.css, js: s.js, settings: usePenSettings.getState().settings }
}

function computeDirty(s: Code & { title: string; baseline: string }): boolean {
  return fingerprint(s.title, sourceOf(s)) !== s.baseline
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  title: DEFAULT_TITLE,
  setTitle: (title) => set((s) => ({ title, dirty: computeDirty({ ...s, title }) })),
  penId: null,
  setPenId: (penId) => set({ penId }),
  isPublic: false,
  setIsPublic: (isPublic) => set({ isPublic }),
  isOwner: true,
  setIsOwner: (isOwner) => set({ isOwner }),
  likeCount: 0,
  likedByMe: false,
  commentCount: 0,
  setSocial: ({ likeCount, likedByMe, commentCount }) => set({ likeCount, likedByMe, commentCount }),
  loadedKey: '',
  setLoadedKey: (loadedKey) => set({ loadedKey }),

  html: DEFAULT_HTML,
  css: DEFAULT_CSS,
  js: DEFAULT_JS,
  setHtml: (html) => set((s) => ({ html, dirty: computeDirty({ ...s, html }) })),
  setCss: (css) => set((s) => ({ css, dirty: computeDirty({ ...s, css }) })),
  setJs: (js) => set((s) => ({ js, dirty: computeDirty({ ...s, js }) })),
  setCode: (code) => set((s) => ({ ...code, dirty: computeDirty({ ...s, ...code }) })),
  getSource: () => sourceOf(get()),
  format: async () => {
    const { html, css, js } = get()
    const { settings } = usePenSettings.getState()
    const [fHtml, fCss, fJs] = await Promise.all([
      formatCode(html, 'html', settings).catch(() => html),
      formatCode(css, 'css', settings).catch(() => css),
      formatCode(js, 'javascript', settings).catch(() => js),
    ])
    set((s) => ({ html: fHtml, css: fCss, js: fJs, dirty: computeDirty({ ...s, html: fHtml, css: fCss, js: fJs }) }))
  },

  baseline: fingerprint(DEFAULT_TITLE, {
    html: DEFAULT_HTML,
    css: DEFAULT_CSS,
    js: DEFAULT_JS,
    settings: defaultPenSettings,
  }),
  dirty: false,
  markSaved: () => set((s) => ({ baseline: fingerprint(s.title, sourceOf(s)), dirty: false })),
  recomputeDirty: () => set((s) => ({ dirty: computeDirty(s) })),
}))
