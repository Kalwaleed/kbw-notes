import { useNavigate } from 'react-router-dom'

export function NotFoundPage() {
  const navigate = useNavigate()
  return <ErrorPage variant="404" onHome={() => navigate('/kbw-notes/home')} onBack={() => navigate(-1)} />
}

interface ErrorPageProps {
  variant: '404' | 'error'
  onHome: () => void
  onBack: () => void
}

export function ErrorPage({ variant, onHome, onBack }: ErrorPageProps) {
  const isNotFound = variant === '404'
  const kicker = isNotFound ? '404 · Not found' : 'Error · Unexpected'
  const headline = isNotFound ? "There is nothing at this address." : 'Something broke.'
  const detail = isNotFound
    ? 'The page you tried to reach does not exist, or has been moved.'
    : 'An unexpected error occurred. The team has been notified. Try again, or go back home.'

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-paper)',
        color: 'var(--color-ink)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-7) var(--space-5)',
      }}
    >
      <div className="paper-grain" aria-hidden="true" />

      <div style={{ width: '100%', maxWidth: 560, position: 'relative', zIndex: 2 }}>
        <hr className="ascii" aria-hidden="true" />

        <div
          className="font-mono uppercase"
          style={{
            fontSize: 'var(--text-mono-xs)',
            letterSpacing: '0.08em',
            color: 'var(--color-accent)',
            fontWeight: 600,
            marginBottom: 'var(--space-3)',
          }}
        >
          {kicker}
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontWeight: 700,
            fontSize: 'var(--text-h1)',
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            color: 'var(--color-ink)',
            margin: 0,
            marginBottom: 'var(--space-5)',
          }}
        >
          {headline}
        </h1>

        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontStyle: 'italic',
            fontSize: 'var(--text-ui-lg)',
            lineHeight: 1.55,
            color: 'var(--color-ink-muted)',
            margin: 0,
            marginBottom: 'var(--space-7)',
            maxWidth: '52ch',
          }}
        >
          {detail}
        </p>

        <div className="flex" style={{ gap: 'var(--space-3)' }}>
          <button
            type="button"
            onClick={onHome}
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
              transition: 'background-color 100ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-accent)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-ink)' }}
          >
            ← Back to home
          </button>
          <button
            type="button"
            onClick={onBack}
            className="font-mono uppercase"
            style={{
              fontSize: 'var(--text-mono-sm)',
              fontWeight: 600,
              letterSpacing: '0.04em',
              background: 'transparent',
              color: 'var(--color-ink)',
              border: '1px solid var(--color-ink)',
              borderRadius: 2,
              padding: '9px 16px',
              cursor: 'pointer',
              transition: 'background-color 100ms ease, color 100ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-ink)'
              e.currentTarget.style.color = 'var(--color-paper)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'var(--color-ink)'
            }}
          >
            Go back
          </button>
        </div>

        <hr className="ascii" aria-hidden="true" style={{ marginTop: 'var(--space-9)' }} />
      </div>
    </div>
  )
}
