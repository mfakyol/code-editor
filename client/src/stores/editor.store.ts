import { create } from 'zustand'
import type { AuthMode } from '@/components/AuthModal'

type EditorState = {
  authMode: AuthMode | null
  pendingAction: (() => void) | null
}

export const useEditorStore = create<EditorState>(() => ({
  authMode: null,
  pendingAction: null,
}))
