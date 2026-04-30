import { Link } from 'react-router-dom'

/**
 * Rejection page — typographic statement, not a chromatic alarm.
 * Rose rule, serif headline, mono detail.
 */
export function RejectedPage() {
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

      <div
        style={{
          width: '100%',
          maxWidth: 560,
          position: 'relative',
          zIndex: 2,
          borderTop: '2px solid var(--color-rose)',
          paddingTop: 'var(--space-7)',
        }}
        className="animate-rejected-slam"
      >
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
          Access · denied
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
          You are not on the invite list.
        </h1>

        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontStyle: 'italic',
            fontSize: 'var(--text-ui-lg)',
            lineHeight: 1.5,
            color: 'var(--color-ink-muted)',
            margin: 0,
            marginBottom: 'var(--space-7)',
            maxWidth: '52ch',
          }}
        >
          This legacy invite-only auth link is no longer part of the public reader.
          Return to the notes archive.
        </p>

        <hr className="ascii short" aria-hidden="true" />

        <Link
          to="/"
          className="font-mono uppercase"
          style={{
            display: 'inline-block',
            fontSize: 'var(--text-mono-sm)',
            fontWeight: 600,
            letterSpacing: '0.04em',
            color: 'var(--color-accent)',
            textDecoration: 'underline',
            textDecorationThickness: 1,
            textUnderlineOffset: 4,
          }}
        >
          ← Back to notes
        </Link>
      </div>
    </div>
  )
}
