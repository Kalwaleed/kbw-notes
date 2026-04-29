import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            background: 'var(--color-paper)',
            color: 'var(--color-ink)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-7) var(--space-5)',
          }}
        >
          <div style={{ maxWidth: 520 }}>
            <div
              className="font-mono uppercase"
              style={{
                fontSize: 'var(--text-mono-xs)',
                letterSpacing: '0.08em',
                color: 'var(--color-rose)',
                fontWeight: 600,
                marginBottom: 'var(--space-3)',
              }}
            >
              Runtime · Error
            </div>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontWeight: 700,
                fontSize: 'var(--text-h2)',
                color: 'var(--color-ink)',
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                margin: 0,
                marginBottom: 'var(--space-4)',
              }}
            >
              Something went wrong.
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontStyle: 'italic',
                fontSize: 'var(--text-ui-lg)',
                color: 'var(--color-ink-muted)',
                margin: 0,
                marginBottom: 'var(--space-5)',
              }}
            >
              An unexpected error occurred. Please refresh the page.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="font-mono uppercase"
              style={{
                fontSize: 'var(--text-mono-sm)',
                fontWeight: 600,
                letterSpacing: '0.04em',
                background: 'var(--color-ink)',
                color: 'var(--color-paper)',
                border: 'none',
                borderRadius: 2,
                padding: '10px 16px',
                cursor: 'pointer',
              }}
            >
              Refresh page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
