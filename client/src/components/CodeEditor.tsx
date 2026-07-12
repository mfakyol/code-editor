import CodeMirror from '@uiw/react-codemirror'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { javascript } from '@codemirror/lang-javascript'
import { markdown } from '@codemirror/lang-markdown'
import { StreamLanguage } from '@codemirror/language'
import { coffeeScript } from '@codemirror/legacy-modes/mode/coffeescript'
import { stylus as stylusMode } from '@codemirror/legacy-modes/mode/stylus'
import { EditorView } from '@codemirror/view'
import { dracula } from '@uiw/codemirror-theme-dracula'
import { githubDark, githubLight } from '@uiw/codemirror-theme-github'
import { abbreviationTracker } from '@emmetio/codemirror6-plugin'
import type { Extension } from '@codemirror/state'
import type { EditorMode } from '@/types/editor'
import { useWorkspaceStore, type EditorTheme } from '@/stores/workspace.store'

const themeMap: Record<EditorTheme, Extension> = {
  dracula,
  githubDark,
  githubLight,
}

const emmetModes: EditorMode[] = ['html', 'css', 'scss', 'less']

type CodeEditorProps = {
  value: string
  mode: EditorMode
  onChange: (value: string) => void
}

const modeExtensions: Record<EditorMode, Extension> = {
  html: html(),
  markdown: markdown(),
  css: css(),
  scss: css(),
  less: css(),
  stylus: StreamLanguage.define(stylusMode),
  javascript: javascript(),
  typescript: javascript({ typescript: true }),
  jsx: javascript({ jsx: true }),
  coffeescript: StreamLanguage.define(coffeeScript),
}

function CodeEditor({ value, mode, onChange }: CodeEditorProps) {
  const { fontSize, editorTheme } = useWorkspaceStore()
  const fontTheme = EditorView.theme({
    '&': { fontSize: `${fontSize}px` },
  })

  const extensions = [modeExtensions[mode], fontTheme]
  if (emmetModes.includes(mode)) {
    extensions.push(abbreviationTracker())
  }

  return (
    <CodeMirror
      value={value}
      height="100%"
      theme={themeMap[editorTheme]}
      extensions={extensions}
      onChange={onChange}
      basicSetup={{
        lineNumbers: true,
        foldGutter: true,
        highlightActiveLine: true,
      }}
      className="h-full text-sm [&_.cm-editor]:h-full [&_.cm-scroller]:overflow-auto"
    />
  )
}

export default CodeEditor
