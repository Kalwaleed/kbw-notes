import { useState, useRef, useEffect } from 'react'
import { Send, X, AlertCircle } from 'lucide-react'

const MAX_COMMENT_LENGTH = 2000

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
  placeholder = 'Share your thoughts...',
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

  // Use internal state or external prop
  const isSubmitting = internalIsSubmitting || externalIsSubmitting

  const charactersRemaining = MAX_COMMENT_LENGTH - content.length
  const isOverLimit = charactersRemaining < 0
  const isEmpty = content.trim().length === 0

  // Clear moderation error when user starts typing
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    if (moderationError) {
      onClearModerationError?.()
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [content])

  // Auto-focus when in reply mode
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [autoFocus])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isEmpty || isOverLimit || isSubmitting) {
      return
    }

    setInternalIsSubmitting(true)
    try {
      await onSubmit?.(content.trim())
      setContent('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    } catch {
      // Error handling is done in the hook - moderation errors are shown via moderationError prop
    } finally {
      setInternalIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Enter or Cmd/Ctrl + Enter
    if (e.key === 'Enter' && !e.shiftKey && !isEmpty && !isOverLimit && !isSubmitting) {
      e.preventDefault() // Prevent newline
      handleSubmit(e)
    }
    // Cancel on Escape in reply mode
    if (e.key === 'Escape' && isReply) {
      onCancel?.()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      {/* Moderation Rejection Alert */}
      {moderationError && (
        <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                Comment Not Posted
              </p>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                {moderationError.message}
              </p>
              <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                Please revise your comment and try again.
              </p>
            </div>
            <button
              type="button"
              onClick={onClearModerationError}
              className="p-1 text-red-400 hover:text-red-600 dark:hover:text-red-300 rounded transition-colors"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div
        className={`
          relative rounded-xl border-2 transition-all duration-200
          ${moderationError
            ? 'border-red-300 dark:border-red-700'
            : isFocused
              ? 'border-violet-400 dark:border-violet-500 shadow-lg shadow-violet-500/10'
              : 'border-slate-200 dark:border-slate-700'
          }
          ${isOverLimit ? 'border-red-400 dark:border-red-500' : ''}
          bg-white dark:bg-slate-800
        `}
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
          className={`
            w-full px-4 py-3 pr-24 text-sm sm:text-base
            bg-transparent resize-none
            text-slate-900 dark:text-white
            placeholder:text-slate-400 dark:placeholder:text-slate-500
            focus:outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          aria-label={isReply ? 'Write a reply' : 'Write a comment'}
          aria-describedby="character-count"
        />

        {/* Action buttons */}
        <div className="absolute right-2 bottom-2 flex items-center gap-1">
          {isReply && (
            <button
              type="button"
              onClick={onCancel}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Cancel reply"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
          )}

          <button
            type="submit"
            disabled={isEmpty || isOverLimit || isSubmitting}
            className={`
              p-2 rounded-lg transition-all
              ${isEmpty || isOverLimit || isSubmitting
                ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                : 'text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/30'
              }
            `}
            aria-label="Submit comment"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>

      {/* Character count and hint */}
      <div className="flex items-center justify-between mt-2 px-1">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          <span className="hidden sm:inline">
            Press <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[10px]">Enter</kbd> to submit
          </span>
        </p>

        {content.length > 0 && (
          <p
            id="character-count"
            className={`text-xs ${
              isOverLimit
                ? 'text-red-500'
                : charactersRemaining < 100
                  ? 'text-amber-500'
                  : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            {charactersRemaining}
          </p>
        )}
      </div>
    </form>
  )
}
