import { useState, type FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth'

/**
 * Email/password login for staff self-report accounts. Provisioned accounts
 * only — no signup or reset here by design (see HANDOFF.md provisioning
 * checklist; resets go through the Supabase dashboard).
 */
export function StaffLogin() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const err = await signIn(email.trim().toLowerCase(), password)
    setSubmitting(false)
    if (err) {
      setError('Sign-in failed. Check your email and password, or contact Donya for access.')
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--text-mono-sm)',
    color: 'var(--color-ink)',
    background: 'var(--color-paper)',
    border: '1px solid var(--color-hair)',
    borderRadius: 4,
  }

  return (
    <div style={{ maxWidth: 420, margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
      <div
        className="font-mono uppercase"
        style={{
          fontSize: 'var(--text-mono-xs)',
          letterSpacing: '0.08em',
          color: 'var(--color-accent)',
          fontWeight: 600,
          marginBottom: 'var(--space-2)',
        }}
      >
        Staff access
      </div>
      <h1
        style={{
          fontFamily: 'var(--font-serif)',
          fontWeight: 700,
          fontSize: 'var(--text-h2)',
          color: 'var(--color-ink)',
          margin: '0 0 var(--space-2)',
        }}
      >
        Sign in
      </h1>
      <p style={{ color: 'var(--color-ink-muted)', marginBottom: 'var(--space-6)' }}>
        Weekly AI adoption self-report. Use the account provisioned for you — there is no
        self-service signup.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span className="font-mono uppercase" style={{ fontSize: 'var(--text-mono-xs)', color: 'var(--color-ink-muted)' }}>
            Email
          </span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span className="font-mono uppercase" style={{ fontSize: 'var(--text-mono-xs)', color: 'var(--color-ink-muted)' }}>
            Password
          </span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
        </label>

        {error && (
          <p role="alert" style={{ color: 'var(--color-danger, #b3261e)', margin: 0, fontSize: 14 }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="font-mono uppercase"
          style={{
            padding: '10px 16px',
            fontSize: 'var(--text-mono-sm)',
            fontWeight: 600,
            letterSpacing: '0.04em',
            color: 'var(--color-paper)',
            background: 'var(--color-accent)',
            border: 'none',
            borderRadius: 4,
            cursor: submitting ? 'wait' : 'pointer',
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
