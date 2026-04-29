import { useState } from 'react'
import type { Comment } from './types'
import { Heart, MessageCircle, Flag, Clock, Trash2 } from 'lucide-react'
import { CommentForm } from './CommentForm'

interface CommentThreadProps {
  comment: Comment
  depth?: number
  currentUserId?: string
  hasReacted?: boolean
  onReply?: (commentId: string, content: string) => Promise<void>
  onDelete?: (commentId: string) => Promise<void>
  onReact?: (commentId: string) => void
  onReport?: (commentId: string) => void
  userReactions?: Set<string>
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return 'now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
}

export function CommentThread({
  comment,
  depth = 0,
  currentUserId,
  hasReacted = false,
  onReply,
  onDelete,
  onReact,
  onReport,
  userReactions,
}: CommentThreadProps) {
  const maxDepth = 3
  const isNested = depth > 0
  const canNestFurther = depth < maxDepth
  const isDeleted = comment.content === '[This comment has been deleted]'
  const isPendingReview = !comment.isModerated
  const isOwnComment = currentUserId && comment.commenter.id === currentUserId
  const hasUserAvatar = comment.commenter.avatarUrl && comment.commenter.avatarUrl.length > 0

  const [isReplying, setIsReplying] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleReplySubmit = async (content: string) => {
    setIsSubmitting(true)
    try {
      await onReply?.(comment.id, content)
      setIsReplying(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment?')) return
    setIsDeleting(true)
    try {
      await onDelete?.(comment.id)
    } finally {
      setIsDeleting(false)
    }
  }

  const getNestedHasReacted = (commentId: string) => userReactions?.has(commentId) ?? false

  return (
    <div
      style={{
        paddingLeft: isNested ? 'var(--space-7)' : 0,
        borderLeft: isNested ? '2px solid var(--color-accent)' : 'none',
        marginLeft: isNested ? 'var(--space-2)' : 0,
      }}
    >
      <div
        style={{
          padding: 'var(--space-4) 0',
          borderTop: isNested && depth === 1 ? 'none' : '1px solid var(--color-hair)',
        }}
      >
        <div className="flex items-start" style={{ gap: 'var(--space-3)' }}>
          {hasUserAvatar ? (
            <img
              src={comment.commenter.avatarUrl!}
              alt={comment.commenter.name}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                objectFit: 'cover',
                flexShrink: 0,
                border: '1px solid var(--color-hair)',
                position: 'sticky',
                top: 96,
              }}
            />
          ) : (
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'var(--color-accent-tint)',
                color: 'var(--color-ink)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-mono-xs)',
                fontWeight: 500,
                flexShrink: 0,
                border: '1px solid var(--color-hair)',
              }}
            >
              {comment.commenter.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Top row: author · timestamp */}
            <div className="flex items-center flex-wrap" style={{ gap: 'var(--space-2)' }}>
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'var(--text-ui-base)',
                  fontWeight: 500,
                  color: 'var(--color-ink)',
                }}
              >
                {comment.commenter.name}
              </span>
              {isOwnComment && (
                <span
                  className="font-mono uppercase"
                  style={{
                    fontSize: 'var(--text-mono-xs)',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    color: 'var(--color-accent)',
                    padding: '1px 6px',
                    border: '1px solid var(--color-accent)',
                    borderRadius: 2,
                  }}
                >
                  You
                </span>
              )}
              <span style={{ color: 'var(--color-ink-soft)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-mono-sm)' }}>·</span>
              <span
                className="font-mono"
                style={{
                  fontSize: 'var(--text-mono-sm)',
                  color: 'var(--color-ink-soft)',
                  letterSpacing: '0.02em',
                }}
              >
                {formatRelativeTime(comment.createdAt)}
              </span>
            </div>

            {/* Pending moderation note */}
            {isPendingReview && !isDeleted && (
              <div
                style={{
                  marginTop: 'var(--space-2)',
                  padding: 'var(--space-2) var(--space-3)',
                  background: 'var(--color-amber-tint)',
                  borderLeft: '2px solid var(--color-amber)',
                  fontFamily: 'var(--font-sans)',
                  fontStyle: 'italic',
                  fontSize: 'var(--text-ui-sm)',
                  color: 'var(--color-amber)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Clock size={12} strokeWidth={1.5} aria-hidden="true" />
                Awaiting moderation — visible only to you.
              </div>
            )}

            {/* Body */}
            <p
              style={{
                marginTop: 'var(--space-2)',
                marginBottom: 0,
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-ui-lg)',
                lineHeight: 1.55,
                color: isDeleted ? 'var(--color-ink-soft)' : 'var(--color-ink)',
                fontStyle: isDeleted ? 'italic' : 'normal',
                maxWidth: '72ch',
              }}
            >
              {comment.content}
            </p>

            {/* Actions */}
            {!isDeleted && (
              <div
                className="flex items-center flex-wrap"
                style={{ gap: 'var(--space-4)', marginTop: 'var(--space-3)' }}
              >
                <ActionLink
                  onClick={() => onReact?.(comment.id)}
                  active={hasReacted}
                  ariaLabel={hasReacted ? 'Unlike comment' : 'Like comment'}
                  ariaPressed={hasReacted}
                >
                  <Heart size={14} strokeWidth={1.5} fill={hasReacted ? 'currentColor' : 'none'} />
                  {comment.reactions > 0 ? `Liked · ${comment.reactions}` : 'Like'}
                </ActionLink>

                {canNestFurther && (
                  <ActionLink
                    onClick={() => setIsReplying(!isReplying)}
                    active={isReplying}
                    ariaLabel="Reply to comment"
                    ariaExpanded={isReplying}
                  >
                    <MessageCircle size={14} strokeWidth={1.5} />
                    Reply
                  </ActionLink>
                )}

                <ActionLink
                  onClick={() => onReport?.(comment.id)}
                  ariaLabel="Report comment"
                >
                  <Flag size={14} strokeWidth={1.5} />
                  Report
                </ActionLink>

                {isOwnComment && (
                  <ActionLink
                    onClick={handleDelete}
                    disabled={isDeleting}
                    destructive
                    ariaLabel="Delete comment"
                  >
                    <Trash2 size={14} strokeWidth={1.5} />
                    Delete
                  </ActionLink>
                )}
              </div>
            )}

            {isReplying && (
              <div style={{ marginTop: 'var(--space-4)' }}>
                <CommentForm
                  placeholder="Write a reply."
                  isReply
                  isSubmitting={isSubmitting}
                  autoFocus
                  onSubmit={handleReplySubmit}
                  onCancel={() => setIsReplying(false)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              currentUserId={currentUserId}
              hasReacted={getNestedHasReacted(reply.id)}
              onReply={onReply}
              onDelete={onDelete}
              onReact={onReact}
              onReport={onReport}
              userReactions={userReactions}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ActionLink({
  onClick,
  active,
  destructive,
  disabled,
  ariaLabel,
  ariaPressed,
  ariaExpanded,
  children,
}: {
  onClick: () => void
  active?: boolean
  destructive?: boolean
  disabled?: boolean
  ariaLabel: string
  ariaPressed?: boolean
  ariaExpanded?: boolean
  children: React.ReactNode
}) {
  const baseColor = active
    ? 'var(--color-accent)'
    : 'var(--color-ink-muted)'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      {...(ariaPressed !== undefined ? { 'aria-pressed': ariaPressed } : {})}
      {...(ariaExpanded !== undefined ? { 'aria-expanded': ariaExpanded } : {})}
      className="font-mono uppercase flex items-center"
      style={{
        gap: 6,
        background: 'transparent',
        border: 'none',
        color: baseColor,
        fontSize: 'var(--text-mono-sm)',
        fontWeight: 500,
        letterSpacing: '0.04em',
        padding: '4px 0',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'color 100ms ease',
      }}
      onMouseEnter={(e) => {
        if (disabled) return
        e.currentTarget.style.color = destructive ? 'var(--color-rose)' : 'var(--color-ink)'
      }}
      onMouseLeave={(e) => { e.currentTarget.style.color = baseColor }}
    >
      {children}
    </button>
  )
}
