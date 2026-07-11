import { create } from 'zustand'
import { defaultPenSettings, type PenSettings, type SettingsTab } from '@/types/preprocessors'

type PenSettingsState = {
  settings: PenSettings
  isOpen: boolean
  activeTab: SettingsTab
  openSettings: (tab: SettingsTab) => void
  setActiveTab: (tab: SettingsTab) => void
  closeSettings: () => void
  updateSettings: (partial: Partial<PenSettings>) => void
}

export const usePenSettings = create<PenSettingsState>((set) => ({
  settings: defaultPenSettings,
  isOpen: false,
  activeTab: 'html',
  openSettings: (tab) => set({ activeTab: tab, isOpen: true }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  closeSettings: () => set({ isOpen: false }),
  updateSettings: (partial) => set((state) => ({ settings: { ...state.settings, ...partial } })),
}))
