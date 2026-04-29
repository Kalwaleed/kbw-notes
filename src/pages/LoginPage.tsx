import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth, useSettings } from '../hooks'
import { useEffect, useState } from 'react'
import { Mail, MailCheck } from 'lucide-react'

type FormState = 'idle' | 'sending' | 'sent' | 'error'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { resolvedTheme, toggleTheme } = useSettings()
  const { user, requestMagicLink, isEmailAllowed, isLoading } = useAuth()

  const [email, setEmail] = useState('')
  const [formState, setFormState] = useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const rawFrom = (location.state as { from?: string })?.from
  const from = (() => {
    if (!rawFrom) return '/kbw-notes/home'
    try {
      const normalized = new URL(rawFrom, window.location.origin).pathname
      return normalized.startsWith('/kbw-notes/') ? normalized : '/kbw-notes/home'
    } catch {
      return '/kbw-notes/home'
    }
  })()

  useEffect(() => {
    if (user && !isLoading) navigate(from, { replace: true })
  }, [user, isLoading, navigate, from])

  const normalizedEmail = email.toLowerCase().trim()
  const isValidDomain = normalizedEmail.length > 0 && isEmailAllowed(normalizedEmail)
  const showDomainWarning = normalizedEmail.length > 0 && normalizedEmail.includes('@') && !isValidDomain

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isValidDomain) {
      setFormState('error')
      setErrorMessage('Only @kbw.vc emails are allowed')
      return
    }

    setFormState('sending')
    setErrorMessage(null)

    const result = await requestMagicLink(normalizedEmail)

    if (result.success) {
      setFormState('sent')
      return
    }

    setFormState('error')
    setErrorMessage(result.error ?? 'An error occurred')
  }

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--color-paper)',
          color: 'var(--color-ink-soft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-mono-sm)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        Loading…
      </div>
    )
  }

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

      <div style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 2 }}>
        {/* Wordmark */}
        <div style={{ textAlign: 'left', marginBottom: 'var(--space-9)' }}>
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
            ── kbw Notes
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 700,
              fontSize: 'var(--text-h2)',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              color: 'var(--color-ink)',
              margin: 0,
              fontFeatureSettings: '"ss02" 1',
            }}
          >
            {formState === 'sent' ? 'Check your inbox.' : 'Sign in.'}
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-ui-base)',
              color: 'var(--color-ink-muted)',
              margin: 0,
              marginTop: 'var(--space-2)',
            }}
          >
            {formState === 'sent'
              ? 'A sign-in link is on its way if your email is on the invite list.'
              : 'Invite-only. Enter your @kbw.vc address to receive a magic link.'}
          </p>
        </div>

        <div style={{ borderTop: '1px solid var(--color-hair)', paddingTop: 'var(--space-7)' }}>
          {formState === 'sent' ? (
            <div>
              <div className="flex items-center" style={{ gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                <MailCheck size={20} strokeWidth={1.5} style={{ color: 'var(--color-accent)' }} />
                <span
                  className="font-mono"
                  style={{
                    fontSize: 'var(--text-mono-sm)',
                    letterSpacing: '0.04em',
                    color: 'var(--color-ink)',
                  }}
                >
                  {normalizedEmail}
                </span>
              </div>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'var(--text-ui-base)',
                  color: 'var(--color-ink-muted)',
                  margin: 0,
                  marginBottom: 'var(--space-5)',
                }}
              >
                The link expires in a few minutes. Open it on this device.
              </p>
              <button
                type="button"
                onClick={() => { setFormState('idle'); setEmail('') }}
                className="font-mono uppercase"
                style={{
                  fontSize: 'var(--text-mono-sm)',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  color: 'var(--color-accent)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textUnderlineOffset: 4,
                  padding: 0,
                }}
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {formState === 'error' && errorMessage && (
                <div
                  role="alert"
                  style={{
                    padding: 'var(--space-3) var(--space-4)',
                    background: 'var(--color-rose-tint)',
                    borderLeft: '2px solid var(--color-rose)',
                    fontFamily: 'var(--font-sans)',
                    fontStyle: 'italic',
                    fontSize: 'var(--text-ui-sm)',
                    color: 'var(--color-rose)',
                    marginBottom: 'var(--space-4)',
                  }}
                >
                  {errorMessage}
                </div>
              )}

              <label
                htmlFor="email"
                className="font-mono uppercase"
                style={{
                  display: 'block',
                  fontSize: 'var(--text-mono-xs)',
                  letterSpacing: '0.08em',
                  color: 'var(--color-ink-soft)',
                  fontWeight: 600,
                  marginBottom: 'var(--space-2)',
                }}
              >
                Email address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  strokeWidth={1.5}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: 12,
                    transform: 'translateY(-50%)',
                    color: 'var(--color-ink-soft)',
                  }}
                  aria-hidden="true"
                />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (formState === 'error') {
                      setFormState('idle')
                      setErrorMessage(null)
                    }
                  }}
                  placeholder="you@kbw.vc"
                  disabled={formState === 'sending'}
                  autoComplete="email"
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 40px',
                    background: 'var(--color-paper-raised)',
                    color: 'var(--color-ink)',
                    border: `1px solid ${showDomainWarning ? 'var(--color-rose)' : 'var(--color-hair)'}`,
                    borderRadius: 0,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-mono-base)',
                    outline: 'none',
                  }}
                />
              </div>
              {showDomainWarning && (
                <p
                  className="font-mono uppercase"
                  style={{
                    margin: 0,
                    marginTop: 'var(--space-2)',
                    fontSize: 'var(--text-mono-xs)',
                    letterSpacing: '0.04em',
                    color: 'var(--color-rose)',
                  }}
                >
                  Only @kbw.vc emails are allowed
                </p>
              )}

              <button
                type="submit"
                disabled={formState === 'sending' || !normalizedEmail || showDomainWarning}
                className="font-mono uppercase"
                style={{
                  width: '100%',
                  marginTop: 'var(--space-5)',
                  padding: '12px 16px',
                  fontSize: 'var(--text-mono-sm)',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  background: 'var(--color-ink)',
                  color: 'var(--color-paper)',
                  border: 'none',
                  borderRadius: 2,
                  cursor: formState === 'sending' || !normalizedEmail || showDomainWarning ? 'not-allowed' : 'pointer',
                  opacity: formState === 'sending' || !normalizedEmail || showDomainWarning ? 0.4 : 1,
                  transition: 'background-color 100ms ease',
                }}
                onMouseEnter={(e) => {
                  if (formState === 'sending' || !normalizedEmail || showDomainWarning) return
                  e.currentTarget.style.background = 'var(--color-accent)'
                }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-ink)' }}
              >
                {formState === 'sending' ? 'Sending…' : 'Send sign-in link'}
              </button>
            </form>
          )}
        </div>

        <div style={{ marginTop: 'var(--space-7)', textAlign: 'center' }}>
          <button
            type="button"
            onClick={toggleTheme}
            className="font-mono uppercase"
            style={{
              fontSize: 'var(--text-mono-xs)',
              letterSpacing: '0.04em',
              color: 'var(--color-ink-soft)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Switch to {resolvedTheme === 'dark' ? 'light' : 'dark'} mode
          </button>
        </div>

        <hr className="ascii short" aria-hidden="true" />

        <p
          className="font-mono uppercase"
          style={{
            margin: 0,
            textAlign: 'center',
            fontSize: 'var(--text-mono-xs)',
            letterSpacing: '0.04em',
            color: 'var(--color-ink-soft)',
          }}
        >
          By signing in, you accept our Terms and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
