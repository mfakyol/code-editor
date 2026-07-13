import { Component, type ErrorInfo, type ReactNode } from 'react'
import { useI18n } from '@/stores/i18n.store'

type Props = { children: ReactNode }
type State = { error: Error | null }

class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Uncaught render error:', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children

    const { t } = useI18n.getState()
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-neutral-900 p-6 text-center text-neutral-200">
        <h1 className="text-xl font-semibold">{t('common.somethingWrong')}</h1>
        <p className="max-w-md text-sm break-words text-neutral-400">{this.state.error.message}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          {t('common.reload')}
        </button>
      </div>
    )
  }
}

export default ErrorBoundary
