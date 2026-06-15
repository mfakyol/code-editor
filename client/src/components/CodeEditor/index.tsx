import CodeMirror from '@uiw/react-codemirror'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { javascript } from '@codemirror/lang-javascript'
import { markdown } from '@codemirror/lang-markdown'
import { dracula } from '@uiw/codemirror-theme-dracula'
import type { Extension } from '@codemirror/state'
import type { EditorMode } from '@/types/editor'

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
  javascript: javascript(),
  typescript: javascript({ typescript: true }),
}

function CodeEditor({ value, mode, onChange }: CodeEditorProps) {
  return (
    <CodeMirror
      value={value}
      height="100%"
      theme={dracula}
      extensions={[modeExtensions[mode]]}
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
