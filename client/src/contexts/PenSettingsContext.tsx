import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import {
  defaultPenSettings,
  type PenSettings,
  type SettingsTab,
} from '@/types/preprocessors'

type PenSettingsContextValue = {
  settings: PenSettings
  isOpen: boolean
  activeTab: SettingsTab
  openSettings: (tab: SettingsTab) => void
  setActiveTab: (tab: SettingsTab) => void
  closeSettings: () => void
  updateSettings: (partial: Partial<PenSettings>) => void
}

const PenSettingsContext = createContext<PenSettingsContextValue | null>(null)

export function PenSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<PenSettings>(defaultPenSettings)
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<SettingsTab>('html')

  const openSettings = useCallback((tab: SettingsTab) => {
    setActiveTab(tab)
    setIsOpen(true)
  }, [])

  const setActiveTabOnly = useCallback((tab: SettingsTab) => {
    setActiveTab(tab)
  }, [])

  const closeSettings = useCallback(() => {
    setIsOpen(false)
  }, [])

  const updateSettings = useCallback((partial: Partial<PenSettings>) => {
    setSettings((current) => ({ ...current, ...partial }))
  }, [])

  return (
    <PenSettingsContext.Provider
      value={{
        settings,
        isOpen,
        activeTab,
        openSettings,
        setActiveTab: setActiveTabOnly,
        closeSettings,
        updateSettings,
      }}
    >
      {children}
    </PenSettingsContext.Provider>
  )
}

export function usePenSettings() {
  const context = useContext(PenSettingsContext)
  if (!context) {
    throw new Error('usePenSettings must be used within PenSettingsProvider')
  }
  return context
}
