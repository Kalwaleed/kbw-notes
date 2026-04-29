import { Edit2, Trash2, Eye, MoreVertical } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import type { Submission } from '../../types/submission'
import { StatusBadge } from './StatusBadge'

interface SubmissionCardProps {
  submission: Submission
  onEdit?: () => void
  onView?: () => void
  onDelete?: () => void
}

function formatEditorialDate(iso: string): string {
  const d = new Date(iso)
  const day = String(d.getUTCDate()).padStart(2, '0')
  const month = d.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }).toUpperCase()
  const year = d.getUTCFullYear()
  return `${day} ${month} ${year}`
}

function formatRelativeTime(iso: string): string {
  const date = new Date(iso)
  const diffMs = Date.now() - date.getTime()
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return formatEditorialDate(iso)
}

export function SubmissionCard({ submission, onEdit, onView, onDelete }: SubmissionCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const title = submission.title || 'Untitled'
  const excerpt = submission.excerpt || 'No excerpt yet.'
  const hasTitle = !!submission.title
  const hasExcerpt = !!submission.excerpt

  return (
    <article
      style={{
        position: 'relative',
        background: 'var(--color-paper-raised)',
        border: '1px solid var(--color-hair)',
        padding: 'var(--space-5)',
      }}
    >
      {submission.coverImageUrl && (
        <div
          style={{
            aspectRatio: '16 / 9',
            background: 'var(--color-paper-sunken)',
            border: '1px solid var(--color-hair)',
            overflow: 'hidden',
            marginBottom: 'var(--space-4)',
          }}
        >
          <img src={submission.coverImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      <div className="flex items-start justify-between" style={{ gap: 8, marginBottom: 'var(--space-3)' }}>
        <StatusBadge status={submission.status} />
        <div ref={menuRef} style={{ position: 'relative', zIndex: 1 }}>
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            aria-label="More options"
            style={{
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              color: 'var(--color-ink-muted)',
              border: 'none',
              borderRadius: 2,
              cursor: 'pointer',
              transition: 'background-color 100ms ease, color 100ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-accent-tint)'
              e.currentTarget.style.color = 'var(--color-ink)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'var(--color-ink-muted)'
            }}
          >
            <MoreVertical size={14} strokeWidth={1.5} />
          </button>
          {showMenu && (
            <div
              className="drawer-enter"
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: 4,
                width: 140,
                background: 'var(--color-paper-raised)',
                border: '1px solid var(--color-hair)',
                boxShadow: '6px 6px 0 0 var(--color-hair)',
                padding: '4px 0',
                zIndex: 30,
              }}
            >
              {onEdit && (
                <MenuItem onClick={() => { setShowMenu(false); onEdit() }}>
                  <Edit2 size={14} strokeWidth={1.5} />
                  Edit
                </MenuItem>
              )}
              {submission.status === 'published' && onView && (
                <MenuItem onClick={() => { setShowMenu(false); onView() }}>
                  <Eye size={14} strokeWidth={1.5} />
                  View
                </MenuItem>
              )}
              {onDelete && (
                <MenuItem destructive onClick={() => { setShowMenu(false); onDelete() }}>
                  <Trash2 size={14} strokeWidth={1.5} />
                  Delete
                </MenuItem>
              )}
            </div>
          )}
        </div>
      </div>

      <h3
        style={{
          fontFamily: 'var(--font-serif)',
          fontWeight: 600,
          fontSize: 'var(--text-card-title)',
          lineHeight: 1.25,
          letterSpacing: '-0.01em',
          color: hasTitle ? 'var(--color-ink)' : 'var(--color-ink-soft)',
          fontStyle: hasTitle ? 'normal' : 'italic',
          margin: 0,
          marginBottom: 'var(--space-2)',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--text-ui-base)',
          lineHeight: 1.55,
          color: hasExcerpt ? 'var(--color-ink-muted)' : 'var(--color-ink-soft)',
          fontStyle: hasExcerpt ? 'normal' : 'italic',
          margin: 0,
          marginBottom: 'var(--space-3)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {excerpt}
      </p>

      {submission.tags.length > 0 && (
        <div className="flex flex-wrap" style={{ gap: 6, marginBottom: 'var(--space-3)' }}>
          {submission.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="font-mono uppercase"
              style={{
                fontSize: 'var(--text-mono-xs)',
                color: 'var(--color-ink-muted)',
                letterSpacing: '0.04em',
                padding: '2px 8px',
                border: '1px solid var(--color-hair)',
                borderRadius: 2,
              }}
            >
              {tag}
            </span>
          ))}
          {submission.tags.length > 3 && (
            <span
              className="font-mono"
              style={{
                fontSize: 'var(--text-mono-xs)',
                color: 'var(--color-ink-soft)',
                padding: '2px 8px',
              }}
            >
              +{submission.tags.length - 3}
            </span>
          )}
        </div>
      )}

      <div
        className="font-mono uppercase"
        style={{
          fontSize: 'var(--text-mono-xs)',
          letterSpacing: '0.04em',
          color: 'var(--color-ink-soft)',
        }}
      >
        {submission.status === 'published' && submission.publishedAt
          ? `Published · ${formatEditorialDate(submission.publishedAt)}`
          : `Edited · ${formatRelativeTime(submission.updatedAt)}`}
      </div>

      <button
        type="button"
        onClick={onEdit}
        aria-label={`Edit ${title}`}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          zIndex: 0,
        }}
      />
    </article>
  )
}

function MenuItem({
  onClick,
  destructive,
  children,
}: {
  onClick: () => void
  destructive?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center"
      style={{
        gap: 8,
        width: '100%',
        textAlign: 'left',
        padding: '8px 12px',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--text-ui-sm)',
        fontWeight: 500,
        color: destructive ? 'var(--color-rose)' : 'var(--color-ink)',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 100ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = destructive ? 'var(--color-rose-tint)' : 'var(--color-accent-tint)'
      }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
    >
      {children}
    </button>
  )
}
