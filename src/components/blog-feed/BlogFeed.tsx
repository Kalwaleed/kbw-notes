import type { BlogFeedProps } from './types'
import { BlogPostCard } from './BlogPostCard'
import { useEffect, useRef, useCallback } from 'react'

/**
 * Asymmetric feed grid. The first card spans two columns ("the lead").
 * Subsequent cards orbit it, one per cell. There is intentionally no
 * three-equal-card row: the lead is always larger than the rest.
 *
 * Below md: single column.
 */
export function BlogFeed({
  blogPosts,
  onViewPost,
  onLike,
  onBookmark,
  onShare,
  onLoadMore,
  isLoading = false,
  hasMore = true,
}: BlogFeedProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries
      if (target.isIntersecting && hasMore && !isLoading) {
        onLoadMore?.()
      }
    },
    [hasMore, isLoading, onLoadMore]
  )

  useEffect(() => {
    const element = loadMoreRef.current
    if (!element) return

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: '100px',
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [handleObserver])

  return (
    <div className="w-full">
      {blogPosts.length > 0 && (
        <div
          className="kbw-feed-grid"
          style={{
            display: 'grid',
            gap: 'var(--space-5)',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          }}
        >
          {blogPosts.map((post, index) => (
            <BlogPostCard
              key={post.id}
              post={post}
              variant={index === 0 ? 'lead' : 'default'}
              onView={() => onViewPost?.(post.id)}
              onLike={onLike ? () => onLike(post.id) : undefined}
              onBookmark={onBookmark ? () => onBookmark(post.id) : undefined}
              onShare={() => onShare?.(post.id)}
            />
          ))}
        </div>
      )}

      {/* The lead card spans two cols on >= md breakpoints. */}
      <style>{`
        .kbw-feed-grid > article:first-child { grid-column: span 1; }
        @media (min-width: 768px) {
          .kbw-feed-grid > article:first-child { grid-column: span 2; }
        }
      `}</style>

      {/* Empty state */}
      {blogPosts.length === 0 && !isLoading && (
        <div
          className="text-center"
          style={{
            padding: 'var(--space-10) var(--space-5)',
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'var(--text-section)',
              fontWeight: 600,
              color: 'var(--color-ink)',
              margin: 0,
              marginBottom: 'var(--space-3)',
            }}
          >
            No posts yet
          </h3>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-ui-base)',
              fontStyle: 'italic',
              color: 'var(--color-ink-muted)',
              margin: 0,
            }}
          >
            Check back soon for new editions.
          </p>
        </div>
      )}

      {/* Infinite-scroll trigger */}
      <div ref={loadMoreRef} style={{ height: 4 }} />

      {/* Loading row — skeletal hairlines, no spinner. */}
      {isLoading && (
        <div
          className="flex items-center justify-center"
          style={{
            gap: 'var(--space-3)',
            padding: 'var(--space-7) 0',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-mono-xs)',
            letterSpacing: '0.08em',
            color: 'var(--color-ink-soft)',
            textTransform: 'uppercase',
          }}
        >
          <span className="skeleton" style={{ display: 'inline-block', width: 32, height: 1 }} />
          <span>Loading more posts…</span>
          <span className="skeleton" style={{ display: 'inline-block', width: 32, height: 1 }} />
        </div>
      )}

      {/* End of feed marker */}
      {!hasMore && blogPosts.length > 0 && (
        <div
          className="text-center"
          style={{
            padding: 'var(--space-7) 0',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-mono-xs)',
            letterSpacing: '0.08em',
            color: 'var(--color-ink-soft)',
            textTransform: 'uppercase',
          }}
        >
          ── END OF FEED ──
        </div>
      )}
    </div>
  )
}
