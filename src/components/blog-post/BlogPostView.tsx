import { useMemo, useState } from 'react'
import DOMPurify from 'dompurify'
import { Twitter, Linkedin, Link2, MessageCircle } from 'lucide-react'
import type { BlogPostCommentsProps, Comment } from './types'
import { CommentThread } from './CommentThread'
import { CommentForm } from './CommentForm'
import { BlogPostSkeleton, CommentSkeleton } from './BlogPostSkeleton'

/** "28 APR 2026" — mono uppercase editorial date */
function formatEditorialDate(iso: string): string {
  const d = new Date(iso)
  const day = String(d.getUTCDate()).padStart(2, '0')
  const month = d.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }).toUpperCase()
  const year = d.getUTCFullYear()
  return `${day} ${month} ${year}`
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

interface TocEntry { id: string; text: string; level: 2 | 3 }

/**
 * Walks DOMPurify-sanitized HTML, assigns ids to H2/H3, prepends a folio
 * span, and returns both the decorated HTML and a TOC entry list.
 *
 * Security: the input is already DOMPurify-sanitized; this pass only adds
 * `id` attributes and a leading `<span class="folio">` to existing
 * heading nodes — it does not introduce executable content.
 */
function decorateAndExtractToc(sanitizedHtml: string): { html: string; toc: TocEntry[] } {
  if (typeof window === 'undefined') return { html: sanitizedHtml, toc: [] }
  const parser = new DOMParser()
  const doc = parser.parseFromString(`<root>${sanitizedHtml}</root>`, 'text/html')
  const root = doc.querySelector('root')
  if (!root) return { html: sanitizedHtml, toc: [] }

  const toc: TocEntry[] = []
  const usedIds = new Set<string>()
  let h2Count = 0
  let h3Count = 0

  root.querySelectorAll('h2, h3').forEach((el) => {
    const text = el.textContent ?? ''
    const baseId = slugify(text) || `section-${toc.length + 1}`
    let id = baseId
    let suffix = 2
    while (usedIds.has(id)) {
      id = `${baseId}-${suffix}`
      suffix += 1
    }
    usedIds.add(id)
    el.setAttribute('id', id)
    const folio = doc.createElement('span')
    folio.className = 'folio'
    folio.setAttribute('aria-hidden', 'true')
    if (el.tagName === 'H2') {
      h2Count += 1
      h3Count = 0
      folio.textContent = `§ ${String(h2Count).padStart(2, '0')}`
      el.insertBefore(folio, el.firstChild)
      toc.push({ id, text, level: 2 })
    } else {
      h3Count += 1
      folio.textContent = `§ ${String(h2Count).padStart(2, '0')}.${String(h3Count).padStart(2, '0')}`
      el.insertBefore(folio, el.firstChild)
      toc.push({ id, text, level: 3 })
    }
  })

  return { html: root.innerHTML, toc }
}

/**
 * Renders pre-sanitized article HTML. Sanitization happens upstream via
 * DOMPurify; this component requires its caller to pass a string already
 * cleaned. Kept tiny so the security review stays narrow.
 */
function ArticleProse({ html }: { html: string }) {
  return (
    <article
      className="prose-article kbw-prose-section"
      // Input is sanitized by DOMPurify in the parent before reaching here.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export function BlogPostView({
  blogPost,
  comments,
  currentUserId,
  userReactions,
  isLoading = false,
  hasMoreComments = false,
  moderationError,
  onClearModerationError,
  onShareTwitter,
  onShareLinkedIn,
  onCopyLink,
  onAddComment,
  onReply,
  onDelete,
  onReact,
  onReport,
  onLoadMore,
}: BlogPostCommentsProps) {
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const filterVisibleComments = (commentsList: Comment[]): Comment[] => {
    return commentsList
      .filter((c) => c.isModerated || c.commenter.id === currentUserId)
      .map((c) => ({ ...c, replies: filterVisibleComments(c.replies || []) }))
  }
  const visibleComments = filterVisibleComments(comments)
  const totalComments = visibleComments.reduce((acc, comment) => {
    const countReplies = (c: Comment): number =>
      1 + (c.replies?.reduce((sum, r) => sum + countReplies(r), 0) || 0)
    return acc + countReplies(comment)
  }, 0)

  const { html: decoratedHtml, toc } = useMemo(() => {
    const sanitized = DOMPurify.sanitize(blogPost.content ?? '', { ADD_ATTR: ['id'] })
    return decorateAndExtractToc(sanitized)
  }, [blogPost.content])

  const handleLoadMore = async () => {
    setIsLoadingMore(true)
    try { await onLoadMore?.() } finally { setIsLoadingMore(false) }
  }

  if (isLoading) return <BlogPostSkeleton />

  const formattedDate = formatEditorialDate(blogPost.publishedAt)
  const initials = blogPost.author.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  const kicker = blogPost.tags[0]?.toUpperCase() ?? 'ESSAY'

  return (
    <div className="kbw-article-grid" style={{ position: 'relative' }}>
      <style>{`
        .kbw-article-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-8);
        }
        @media (min-width: 1024px) {
          .kbw-article-grid {
            grid-template-columns: 1fr var(--container-prose) 1fr;
          }
        }
        .kbw-article-toc, .kbw-article-meta {
          display: none;
        }
        @media (min-width: 1024px) {
          .kbw-article-toc, .kbw-article-meta {
            display: block;
            position: sticky;
            top: 96px;
            align-self: start;
            max-height: calc(100vh - 96px);
            overflow-y: auto;
          }
        }
        .kbw-toc-link {
          display: block;
          font-family: var(--font-mono);
          font-size: var(--text-mono-sm);
          color: var(--color-ink-muted);
          padding: 4px 0;
          text-decoration: none;
          letter-spacing: 0.02em;
          line-height: 1.4;
          transition: color 100ms ease;
        }
        .kbw-toc-link:hover { color: var(--color-ink); }
        .kbw-article-main { min-width: 0; }
        .kbw-prose-section h2, .kbw-prose-section h3 { scroll-margin-top: 80px; }
      `}</style>

      <aside className="kbw-article-toc" aria-label="Table of contents">
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-mono-xs)',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--color-ink-soft)',
            paddingBottom: 'var(--space-3)',
            borderBottom: '1px solid var(--color-hair)',
            marginBottom: 'var(--space-3)',
          }}
        >
          Contents
        </div>
        {toc.length === 0 ? (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-mono-xs)', color: 'var(--color-ink-soft)' }}>
            ──
          </div>
        ) : (
          toc.map((entry) => (
            <a
              key={entry.id}
              href={`#${entry.id}`}
              className="kbw-toc-link"
              style={{ paddingLeft: entry.level === 3 ? 16 : 0 }}
            >
              {entry.text}
            </a>
          ))
        )}
      </aside>

      <div className="kbw-article-main">
        {toc.length > 0 && (
          <details
            style={{
              border: '1px solid var(--color-hair)',
              padding: 'var(--space-3) var(--space-4)',
              marginBottom: 'var(--space-7)',
            }}
            className="lg:hidden"
          >
            <summary
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-mono-sm)',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'var(--color-ink-muted)',
                cursor: 'pointer',
              }}
            >
              Contents · {toc.length}
            </summary>
            <div style={{ marginTop: 'var(--space-3)' }}>
              {toc.map((entry) => (
                <a
                  key={entry.id}
                  href={`#${entry.id}`}
                  className="kbw-toc-link"
                  style={{ paddingLeft: entry.level === 3 ? 16 : 0 }}
                >
                  {entry.text}
                </a>
              ))}
            </div>
          </details>
        )}

        <div
          className="font-mono uppercase"
          style={{
            fontSize: 'var(--text-h1-meta)',
            fontWeight: 600,
            letterSpacing: '0.05em',
            color: 'var(--color-accent)',
            marginBottom: 'var(--space-4)',
          }}
        >
          {kicker}
        </div>

        {blogPost.tags.length > 1 && (
          <div className="flex flex-wrap" style={{ gap: 8, marginBottom: 'var(--space-4)' }}>
            {blogPost.tags.slice(1).map((tag) => (
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

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 2.4fr) minmax(0, 1fr)',
            gap: 'var(--space-7)',
            alignItems: 'baseline',
            marginBottom: 'var(--space-9)',
          }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 700,
              fontSize: 'var(--text-h1)',
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              color: 'var(--color-ink)',
              margin: 0,
            }}
          >
            {blogPost.title}
          </h1>
          <div style={{ alignSelf: 'end' }}>
            <div className="flex items-center" style={{ gap: 8, marginBottom: 8 }}>
              {blogPost.author.avatarUrl ? (
                <img
                  src={blogPost.author.avatarUrl}
                  alt={blogPost.author.name}
                  style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--color-hair)' }}
                />
              ) : (
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'var(--color-accent-tint)',
                    color: 'var(--color-ink)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'var(--text-ui-sm)',
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
                  fontSize: 'var(--text-ui-base)',
                  fontWeight: 500,
                  color: 'var(--color-ink)',
                }}
              >
                {blogPost.author.name}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
              {typeof blogPost.readingTime === 'number' && (
                <span
                  className="font-mono uppercase"
                  style={{
                    fontSize: 'var(--text-mono-sm)',
                    color: 'var(--color-ink-soft)',
                    letterSpacing: '0.02em',
                  }}
                >
                  {blogPost.readingTime} MIN READ
                </span>
              )}
            </div>
          </div>
        </div>

        {blogPost.excerpt && (
          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: 22,
              lineHeight: 1.4,
              color: 'var(--color-ink-muted)',
              margin: 0,
              marginBottom: 'var(--space-8)',
              maxWidth: '60ch',
            }}
          >
            {blogPost.excerpt}
          </p>
        )}

        {blogPost.coverImageUrl && (
          <figure
            style={{
              margin: 0,
              marginBottom: 'var(--space-8)',
              borderTop: '1px solid var(--color-hair)',
              borderBottom: '1px solid var(--color-hair)',
              padding: 'var(--space-3) 0',
            }}
          >
            <div
              style={{
                aspectRatio: '16 / 9',
                background: 'var(--color-paper-sunken)',
                overflow: 'hidden',
              }}
            >
              <img
                src={blogPost.coverImageUrl}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>
          </figure>
        )}

        <ArticleProse html={decoratedHtml} />

        <hr className="ascii" aria-hidden="true" />

        <div
          style={{
            background: 'var(--color-accent-tint)',
            borderTop: '2px solid var(--color-accent)',
            padding: 'var(--space-7)',
            marginTop: 'var(--space-8)',
          }}
        >
          <div
            className="font-mono uppercase"
            style={{
              fontSize: 'var(--text-mono-base)',
              fontWeight: 600,
              letterSpacing: '0.06em',
              color: 'var(--color-ink)',
              marginBottom: 'var(--space-3)',
            }}
          >
            Share this post
          </div>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-ui-base)',
              color: 'var(--color-ink-muted)',
              margin: 0,
              marginBottom: 'var(--space-4)',
            }}
          >
            If this was worth reading, send it to one person who would also read it.
          </p>
          <div className="flex items-center" style={{ gap: 8 }}>
            <ShareIconButton onClick={onShareTwitter} label="Share on X" Icon={Twitter} text="X" />
            <ShareIconButton onClick={onShareLinkedIn} label="Share on LinkedIn" Icon={Linkedin} text="IN" />
            <ShareIconButton onClick={onCopyLink} label="Copy link to clipboard" Icon={Link2} text="URL" />
          </div>
        </div>

        <section style={{ marginTop: 'var(--space-9)' }}>
          <div
            className="flex items-center"
            style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}
          >
            <MessageCircle size={16} strokeWidth={1.5} style={{ color: 'var(--color-ink)' }} aria-hidden="true" />
            <h2
              className="font-mono uppercase"
              style={{
                fontSize: 'var(--text-mono-base)',
                fontWeight: 600,
                letterSpacing: '0.04em',
                color: 'var(--color-ink)',
                margin: 0,
              }}
              aria-live="polite"
            >
              Discussion ({totalComments})
            </h2>
          </div>

          <div style={{ marginBottom: 'var(--space-7)' }}>
            <CommentForm
              placeholder="Share your thoughts."
              onSubmit={onAddComment}
              moderationError={moderationError}
              onClearModerationError={onClearModerationError}
            />
          </div>

          {visibleComments.length === 0 ? (
            <div style={{ padding: 'var(--space-7) 0', textAlign: 'center' }}>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontStyle: 'italic',
                  color: 'var(--color-ink-muted)',
                  margin: 0,
                }}
              >
                No comments yet — be the first.
              </p>
            </div>
          ) : (
            <>
              <div>
                {visibleComments.map((comment) => (
                  <CommentThread
                    key={comment.id}
                    comment={comment}
                    currentUserId={currentUserId}
                    hasReacted={userReactions?.has(comment.id) ?? false}
                    onReply={onReply}
                    onDelete={onDelete}
                    onReact={onReact}
                    onReport={onReport}
                    userReactions={userReactions}
                  />
                ))}
              </div>

              {hasMoreComments && (
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  style={{
                    width: '100%',
                    height: 44,
                    background: 'transparent',
                    border: '1px solid var(--color-hair)',
                    borderRadius: 2,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-mono-sm)',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: 'var(--color-ink-muted)',
                    marginTop: 'var(--space-5)',
                    cursor: isLoadingMore ? 'not-allowed' : 'pointer',
                    opacity: isLoadingMore ? 0.4 : 1,
                  }}
                >
                  {isLoadingMore ? 'Loading…' : 'Load more comments'}
                </button>
              )}
              {isLoadingMore && (
                <div style={{ marginTop: 'var(--space-4)' }}>
                  <CommentSkeleton />
                  <CommentSkeleton />
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <aside className="kbw-article-meta" aria-label="Article metadata">
        {typeof blogPost.readingTime === 'number' && (
          <MetaCard label="Reading time" value={`${blogPost.readingTime} MIN`} />
        )}
        <MetaCard
          label="Share"
          value={
            <div className="flex" style={{ gap: 6, marginTop: 6 }}>
              <ShareIconButton onClick={onShareTwitter} label="Share on X" Icon={Twitter} text="X" />
              <ShareIconButton onClick={onShareLinkedIn} label="Share on LinkedIn" Icon={Linkedin} text="IN" />
              <ShareIconButton onClick={onCopyLink} label="Copy link to clipboard" Icon={Link2} text="URL" />
            </div>
          }
        />
      </aside>
    </div>
  )
}

function MetaCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ borderTop: '1px solid var(--color-hair)', padding: 'var(--space-3) 0' }}>
      <div
        className="font-mono uppercase"
        style={{
          fontSize: 'var(--text-mono-xs)',
          letterSpacing: '0.08em',
          color: 'var(--color-ink-soft)',
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: typeof value === 'string' ? 'var(--font-mono)' : 'inherit',
          fontSize: 'var(--text-mono-base)',
          color: 'var(--color-ink)',
          letterSpacing: typeof value === 'string' ? '0.02em' : 0,
        }}
      >
        {value}
      </div>
    </div>
  )
}

function ShareIconButton({
  onClick,
  label,
  Icon,
  text,
}: {
  onClick?: () => void
  label: string
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>
  text: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        height: 32,
        padding: '0 10px',
        background: 'transparent',
        border: '1px solid var(--color-hair)',
        borderRadius: 2,
        color: 'var(--color-ink)',
        cursor: 'pointer',
        transition: 'background-color 100ms ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-accent-tint)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
    >
      <Icon size={14} strokeWidth={1.5} />
      <span
        className="font-mono uppercase"
        style={{
          fontSize: 'var(--text-mono-xs)',
          fontWeight: 600,
          letterSpacing: '0.04em',
          color: 'var(--color-ink-muted)',
        }}
      >
        {text}
      </span>
    </button>
  )
}
