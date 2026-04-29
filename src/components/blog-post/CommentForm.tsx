import { useState, useRef, useEffect } from 'react'
import { Send, X, AlertCircle } from 'lucide-react'

const MAX_COMMENT_LENGTH = 500 // ~1 paragraph limit

interface ModerationErrorState {
  message: string
  category?: string
}

export interface CommentFormProps {
  /** Placeholder text for the input */
  placeholder?: string
  /** Called when user submits a comment */
  onSubmit?: (content: string) => Promise<void>
  /** Called when user wants to cancel (for reply mode) */
  onCancel?: () => void
  /** Whether the form is in reply mode */
  isReply?: boolean
  /** Whether the form is currently submitting */
  isSubmitting?: boolean
  /** Auto-focus the input */
  autoFocus?: boolean
  /** Moderation error from AI rejection */
  moderationError?: ModerationErrorState | null
  /** Called to clear moderation error */
  onClearModerationError?: () => void
}

export function CommentForm({
  placeholder = 'Share your thoughts.',
  onSubmit,
  onCancel,
  isReply = false,
  isSubmitting: externalIsSubmitting = false,
  autoFocus = false,
  moderationError,
  onClearModerationError,
}: CommentFormProps) {
  const [content, setContent] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const isSubmitting = internalIsSubmitting || externalIsSubmitting
  const charactersRemaining = MAX_COMMENT_LENGTH - content.length
  const isOverLimit = charactersRemaining < 0
  const isEmpty = content.trim().length === 0

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    if (moderationError) onClearModerationError?.()
  }

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.max(textarea.scrollHeight, 96)}px`
    }
  }, [content])

  useEffect(() => {
    if (autoFocus && textareaRef.current) textareaRef.current.focus()
  }, [autoFocus])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isEmpty || isOverLimit || isSubmitting) return

    setInternalIsSubmitting(true)
    try {
      await onSubmit?.(content.trim())
      setContent('')
      if (textareaRef.current) textareaRef.current.style.height = '96px'
    } catch {
      /* moderation errors surface via the prop */
    } finally {
      setInternalIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !isEmpty && !isOverLimit && !isSubmitting) {
      e.preventDefault()
      handleSubmit(e)
    }
    if (e.key === 'Escape' && isReply) onCancel?.()
  }

  const borderColor = moderationError
    ? 'var(--color-rose)'
    : isOverLimit
      ? 'var(--color-rose)'
      : isFocused
        ? 'var(--color-accent)'
        : 'var(--color-hair)'

  return (
    <form onSubmit={handleSubmit}>
      {moderationError && (
        <div
          role="alert"
          style={{
            marginBottom: 'var(--space-4)',
            padding: 'var(--space-3) var(--space-4)',
            background: 'var(--color-amber-tint)',
            borderLeft: '2px solid var(--color-amber)',
            display: 'flex',
            gap: 'var(--space-3)',
            alignItems: 'flex-start',
          }}
        >
          <AlertCircle size={16} strokeWidth={1.5} style={{ color: 'var(--color-amber)', flexShrink: 0, marginTop: 2 }} />
          <div style={{ flex: 1 }}>
            <p
              style={{
                margin: 0,
                fontFamily: 'var(--font-sans)',
                fontStyle: 'italic',
                fontSize: 'var(--text-ui-base)',
                color: 'var(--color-amber)',
              }}
            >
              {moderationError.message}
            </p>
            <p
              style={{
                margin: 0,
                marginTop: 4,
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-mono-xs)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'var(--color-ink-soft)',
              }}
            >
              Revise and resubmit.
            </p>
          </div>
          <button
            type="button"
            onClick={onClearModerationError}
            aria-label="Dismiss error"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-ink-muted)',
              padding: 4,
            }}
          >
            <X size={14} strokeWidth={1.5} />
          </button>
        </div>
      )}

      <div
        style={{
          padding: 'var(--space-4)',
          background: 'var(--color-paper-raised)',
          border: `1px solid ${borderColor}`,
          transition: 'border-color 100ms ease',
        }}
      >
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isSubmitting}
          rows={1}
          style={{
            width: '100%',
            minHeight: 96,
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-ui-base)',
            lineHeight: 1.55,
            color: 'var(--color-ink)',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            resize: 'vertical',
            padding: 0,
          }}
          aria-label={isReply ? 'Write a reply' : 'Write a comment'}
          aria-describedby="character-count"
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 'var(--space-3)',
          }}
        >
          <span
            id="character-count"
            className="font-mono"
            style={{
              fontSize: 'var(--text-mono-xs)',
              letterSpacing: '0.02em',
              color: isOverLimit
                ? 'var(--color-rose)'
                : charactersRemaining < 100
                  ? 'var(--color-amber)'
                  : 'var(--color-ink-soft)',
            }}
          >
            {content.length} / {MAX_COMMENT_LENGTH}
          </span>

          <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
            {isReply && (
              <button
                type="button"
                onClick={onCancel}
                className="font-mono uppercase"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-ink-muted)',
                  fontSize: 'var(--text-mono-sm)',
                  fontWeight: 500,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  padding: '6px 8px',
                  textDecoration: 'underline',
                  textDecorationThickness: 1,
                  textUnderlineOffset: 3,
                }}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isEmpty || isOverLimit || isSubmitting}
              aria-label="Submit comment"
              className="font-mono uppercase flex items-center"
              style={{
                gap: 6,
                fontSize: 'var(--text-mono-sm)',
                fontWeight: 600,
                letterSpacing: '0.04em',
                background: 'var(--color-ink)',
                color: 'var(--color-paper)',
                border: 'none',
                borderRadius: 2,
                height: 36,
                padding: '0 16px',
                cursor: isEmpty || isOverLimit || isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isEmpty || isOverLimit || isSubmitting ? 0.4 : 1,
                transition: 'background-color 100ms ease',
              }}
              onMouseEnter={(e) => {
                if (isEmpty || isOverLimit || isSubmitting) return
                e.currentTarget.style.background = 'var(--color-accent)'
              }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-ink)' }}
            >
              {isSubmitting ? 'Sending…' : (
                <>
                  <Send size={14} strokeWidth={1.5} />
                  Send
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
