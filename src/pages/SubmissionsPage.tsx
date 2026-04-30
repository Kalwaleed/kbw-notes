import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Send } from 'lucide-react'
import { AppShell } from '../components/shell'
import { submitReaderSubmission } from '../lib/queries/readerSubmissions'
import type React from 'react'

interface FormState {
  submitterName: string
  submitterEmail: string
  title: string
  excerpt: string
  content: string
  tags: string
}

const initialForm: FormState = {
  submitterName: '',
  submitterEmail: '',
  title: '',
  excerpt: '',
  content: '',
  tags: '',
}

export function SubmissionsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState<FormState>(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmationId, setConfirmationId] = useState<string | null>(null)

  const navigationItems = [
    { label: 'Home',        href: '/kbw-notes/home',        isActive: false },
    { label: 'Submissions', href: '/kbw-notes/submissions', isActive: location.pathname === '/kbw-notes/submissions' },
    { label: 'Settings',    href: '/kbw-notes/settings',    isActive: false },
  ]

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
    if (error) setError(null)
  }

  const validate = (): string | null => {
    if (form.submitterName.trim().length < 2) return 'Name is required.'
    if (form.title.trim().length < 3) return 'Title is required.'
    if (form.content.trim().length < 20) return 'Post body must be at least 20 characters.'
    if (form.excerpt.length > 500) return 'Excerpt must be 500 characters or fewer.'
    return null
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const id = await submitReaderSubmission({
        submitterName: form.submitterName,
        submitterEmail: form.submitterEmail,
        title: form.title,
        excerpt: form.excerpt,
        content: form.content,
        tags: form.tags.split(','),
      })
      setConfirmationId(id)
      setForm(initialForm)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AppShell
      navigationItems={navigationItems}
      onNavigate={(href) => navigate(href)}
      containerWidth="prose"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-7)' }}>
        <header>
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
            Open submissions
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
            }}
          >
            Submit a note.
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-ui-base)',
              fontStyle: 'italic',
              color: 'var(--color-ink-muted)',
              margin: 0,
              marginTop: 'var(--space-2)',
              maxWidth: '58ch',
            }}
          >
            Send a finished draft or a tight operating note for review. Publishing remains editorially controlled.
          </p>
        </header>

        {confirmationId && (
          <div
            role="status"
            style={{
              borderTop: '2px solid var(--color-accent)',
              background: 'var(--color-accent-tint)',
              padding: 'var(--space-5)',
            }}
          >
            <div
              className="font-mono uppercase"
              style={{
                fontSize: 'var(--text-mono-sm)',
                fontWeight: 600,
                letterSpacing: '0.06em',
                color: 'var(--color-ink)',
                marginBottom: 'var(--space-2)',
              }}
            >
              Submission received
            </div>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-ui-base)',
                color: 'var(--color-ink-muted)',
                margin: 0,
              }}
            >
              Reference {confirmationId.slice(0, 8)}. The draft is in review.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div style={{ display: 'grid', gap: 'var(--space-4)', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <Field label="Name" required>
              <input
                value={form.submitterName}
                onChange={(event) => updateField('submitterName', event.target.value)}
                maxLength={120}
                required
                style={inputStyle}
              />
            </Field>
            <Field label="Email">
              <input
                value={form.submitterEmail}
                onChange={(event) => updateField('submitterEmail', event.target.value)}
                type="email"
                maxLength={240}
                style={inputStyle}
              />
            </Field>
          </div>

          <Field label="Title" required>
            <input
              value={form.title}
              onChange={(event) => updateField('title', event.target.value)}
              maxLength={180}
              required
              style={inputStyle}
            />
          </Field>

          <Field label="Excerpt">
            <textarea
              value={form.excerpt}
              onChange={(event) => updateField('excerpt', event.target.value)}
              maxLength={500}
              rows={3}
              style={textareaStyle}
            />
          </Field>

          <Field label="Post body" required>
            <textarea
              value={form.content}
              onChange={(event) => updateField('content', event.target.value)}
              minLength={20}
              maxLength={30000}
              rows={14}
              required
              style={textareaStyle}
            />
          </Field>

          <Field label="Tags">
            <input
              value={form.tags}
              onChange={(event) => updateField('tags', event.target.value)}
              placeholder="strategy, ai, operating-notes"
              maxLength={240}
              style={inputStyle}
            />
          </Field>

          {error && (
            <div
              role="alert"
              style={{
                borderLeft: '2px solid var(--color-rose)',
                background: 'var(--color-rose-tint)',
                padding: 'var(--space-3) var(--space-4)',
                fontFamily: 'var(--font-sans)',
                color: 'var(--color-rose)',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="font-mono uppercase inline-flex items-center justify-center"
            style={{
              gap: 8,
              width: 'fit-content',
              minWidth: 160,
              height: 40,
              padding: '0 16px',
              background: 'var(--color-ink)',
              color: 'var(--color-paper)',
              border: 'none',
              borderRadius: 2,
              fontSize: 'var(--text-mono-sm)',
              fontWeight: 600,
              letterSpacing: '0.04em',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.5 : 1,
            }}
          >
            {isSubmitting ? 'Submitting...' : (
              <>
                <Send size={14} strokeWidth={1.5} />
                Submit
              </>
            )}
          </button>
        </form>
      </div>
    </AppShell>
  )
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span
        className="font-mono uppercase"
        style={{
          fontSize: 'var(--text-mono-xs)',
          color: 'var(--color-ink-muted)',
          letterSpacing: '0.06em',
          fontWeight: 600,
        }}
      >
        {label}{required ? ' *' : ''}
      </span>
      {children}
    </label>
  )
}

const inputStyle: React.CSSProperties = {
  height: 42,
  width: '100%',
  border: '1px solid var(--color-hair)',
  borderRadius: 2,
  background: 'var(--color-paper-raised)',
  color: 'var(--color-ink)',
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--text-ui-base)',
  padding: '0 12px',
  outline: 'none',
}

const textareaStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid var(--color-hair)',
  borderRadius: 2,
  background: 'var(--color-paper-raised)',
  color: 'var(--color-ink)',
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--text-ui-base)',
  lineHeight: 1.55,
  padding: '12px',
  resize: 'vertical',
  outline: 'none',
}
