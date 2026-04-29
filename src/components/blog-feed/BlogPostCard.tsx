import type { BlogPost } from './types'
import { Heart, Bookmark, Share2, MessageCircle } from 'lucide-react'

interface BlogPostCardProps {
  post: BlogPost
  /** Lead card sits at the top of the asymmetric grid and uses raised paper
   *  with a hairline border + larger title. */
  variant?: 'default' | 'lead'
  /** A folio number to print above the tags row. Falls back to a derived
   *  short id from the post if not supplied. */
  folio?: string
  onView?: () => void
  onLike?: () => void
  onBookmark?: () => void
  onShare?: () => void
}

/** Render the publish date in mono uppercase: "28 APR 2026". */
function formatEditorialDate(iso: string): string {
  const d = new Date(iso)
  const day = String(d.getUTCDate()).padStart(2, '0')
  const month = d.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }).toUpperCase()
  const year = d.getUTCFullYear()
  return `${day} ${month} ${year}`
}

function deriveFolio(id: string): string {
  // Last 3 hex chars of the id, decimal-leading-zero. Stable, deterministic.
  const tail = id.replace(/[^0-9a-fA-F]/g, '').slice(-3) || '000'
  const n = parseInt(tail, 16) % 1000
  return `№ ${String(n).padStart(3, '0')}`
}

export function BlogPostCard({
  post,
  variant = 'default',
  folio,
  onView,
  onLike,
  onBookmark,
  onShare,
}: BlogPostCardProps) {
  const isLead = variant === 'lead'
  const formattedDate = formatEditorialDate(post.publishedAt)
  const folioLabel = folio ?? deriveFolio(post.id)

  const initials = post.author.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <article
      style={{
        position: 'relative',
        background: isLead ? 'var(--color-paper-raised)' : 'var(--color-paper)',
        border: isLead ? '1px solid var(--color-hair)' : 'none',
        borderTop: isLead ? '1px solid var(--color-hair)' : '1px solid var(--color-hair)',
        padding: 'var(--space-6) var(--space-4)',
      }}
    >
      <button
        type="button"
        onClick={onView}
        aria-label={`View post: ${post.title}`}
        className="w-full"
        style={{
          display: 'block',
          width: '100%',
          textAlign: 'left',
          background: 'transparent',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
        }}
      >
        {isLead && (
          <div
            style={{
              aspectRatio: '16 / 9',
              background: 'var(--color-paper-sunken)',
              border: '1px solid var(--color-hair)',
              marginBottom: 'var(--space-5)',
              overflow: 'hidden',
            }}
          >
            {post.coverImageUrl && (
              <img
                src={post.coverImageUrl}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            )}
          </div>
        )}

        {!isLead && post.coverImageUrl && (
          <div
            style={{
              aspectRatio: '16 / 9',
              background: 'var(--color-paper-sunken)',
              border: '1px solid var(--color-hair)',
              marginBottom: 'var(--space-4)',
              overflow: 'hidden',
            }}
          >
            <img
              src={post.coverImageUrl}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        )}

        {/* Folio number */}
        <div
          className="font-mono uppercase"
          style={{
            fontSize: 'var(--text-mono-xs)',
            color: 'var(--color-ink-soft)',
            letterSpacing: '0.08em',
            marginBottom: 'var(--space-2)',
          }}
        >
          {folioLabel}
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap" style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
            {post.tags.map((tag) => (
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
          </div>
        )}

        {/* Title */}
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontWeight: 600,
            fontSize: isLead ? 'var(--text-card-title-lg)' : 'var(--text-card-title)',
            lineHeight: isLead ? 1.2 : 1.25,
            letterSpacing: isLead ? '-0.015em' : '-0.01em',
            color: 'var(--color-ink)',
            margin: 0,
            marginBottom: 'var(--space-3)',
            transition: 'color 100ms ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-accent)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-ink)' }}
        >
          {post.title}
        </h2>

        {/* Excerpt */}
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-ui-base)',
            lineHeight: 1.55,
            color: 'var(--color-ink-muted)',
            margin: 0,
            marginBottom: 'var(--space-4)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {post.excerpt}
        </p>

        {/* Byline row */}
        <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
          {post.author.avatarUrl ? (
            <img
              src={post.author.avatarUrl}
              alt={post.author.name}
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '1px solid var(--color-hair)',
              }}
            />
          ) : (
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: 'var(--color-accent-tint)',
                color: 'var(--color-ink)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-sans)',
                fontSize: 11,
                fontWeight: 500,
                border: '1px solid var(--color-hair)',
              }}
            >
              {initials}
            </div>
          )}
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-ui-sm)',
              fontWeight: 500,
              color: 'var(--color-ink)',
            }}
          >
            {post.author.name}
          </span>
          <span style={{ color: 'var(--color-ink-soft)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-mono-sm)' }}>·</span>
          <span
            className="font-mono uppercase"
            style={{
              fontSize: 'var(--text-mono-sm)',
              color: 'var(--color-ink-soft)',
              letterSpacing: '0.02em',
            }}
          >
            {formattedDate}
          </span>
        </div>
      </button>

      {/* Action bar */}
      <div
        className="flex items-center justify-between"
        style={{
          marginTop: 'var(--space-5)',
          paddingTop: 'var(--space-3)',
          borderTop: '1px solid var(--color-hair)',
        }}
      >
        <div className="flex items-center" style={{ gap: 'var(--space-4)' }}>
          <span
            className="flex items-center"
            style={{
              gap: 6,
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-mono-sm)',
              color: post.isLiked ? 'var(--color-rose)' : 'var(--color-ink-muted)',
              fontWeight: post.isLiked ? 600 : 500,
            }}
          >
            <Heart size={14} strokeWidth={1.5} fill={post.isLiked ? 'currentColor' : 'none'} />
            {post.likeCount}
          </span>
          <span
            className="flex items-center"
            style={{
              gap: 6,
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-mono-sm)',
              color: 'var(--color-ink-muted)',
            }}
          >
            <MessageCircle size={14} strokeWidth={1.5} />
            {post.commentCount}
          </span>
        </div>

        <div className="flex items-center" style={{ gap: 4 }}>
          <IconButton
            label={post.isLiked ? 'Unlike' : 'Like'}
            active={post.isLiked}
            onClick={(e) => {
              e.stopPropagation()
              onLike?.()
            }}
          >
            <Heart size={16} strokeWidth={1.5} fill={post.isLiked ? 'currentColor' : 'none'} />
          </IconButton>
          <IconButton
            label={post.isBookmarked ? 'Remove bookmark' : 'Bookmark'}
            active={post.isBookmarked}
            onClick={(e) => {
              e.stopPropagation()
              onBookmark?.()
            }}
          >
            <Bookmark size={16} strokeWidth={1.5} fill={post.isBookmarked ? 'currentColor' : 'none'} />
          </IconButton>
          <IconButton
            label="Share"
            onClick={(e) => {
              e.stopPropagation()
              onShare?.()
            }}
          >
            <Share2 size={16} strokeWidth={1.5} />
          </IconButton>
        </div>
      </div>
    </article>
  )
}

function IconButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string
  active?: boolean
  onClick: (e: React.MouseEvent) => void
  children: React.ReactNode
}) {
  const color = active
    ? (label === 'Unlike' ? 'var(--color-rose)' : 'var(--color-accent)')
    : 'var(--color-ink-muted)'
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      style={{
        width: 32,
        height: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        color,
        border: 'none',
        borderRadius: 2,
        cursor: 'pointer',
        transition: 'background-color 100ms ease, color 100ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--color-accent-tint)'
        if (!active) e.currentTarget.style.color = 'var(--color-ink)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
        if (!active) e.currentTarget.style.color = 'var(--color-ink-muted)'
      }}
    >
      {children}
    </button>
  )
}
