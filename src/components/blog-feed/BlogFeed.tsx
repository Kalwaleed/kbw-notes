import type { BlogFeedProps } from './types'
import { BlogPostCard } from './BlogPostCard'
import { Loader2 } from 'lucide-react'
import { useEffect, useRef, useCallback } from 'react'

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

  // Infinite scroll observer
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
      {/* Feed Grid */}
      <div className="grid gap-6 md:gap-8" style={{ gap: 'var(--density-gap, 1.5rem)' }}>
        {blogPosts.map((post, index) => (
          <div
            key={post.id}
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
          >
            <BlogPostCard
              post={post}
              onView={() => onViewPost?.(post.id)}
              onLike={() => onLike?.(post.id)}
              onBookmark={() => onBookmark?.(post.id)}
              onShare={() => onShare?.(post.id)}
            />
          </div>
        ))}
      </div>

      {/* Empty State */}
      {blogPosts.length === 0 && !isLoading && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          </div>
          <h3
            className="text-lg font-semibold text-slate-900 dark:text-white mb-2"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            No posts yet
          </h3>
          <p
            className="text-slate-500 dark:text-slate-400"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Check back soon for new content.
          </p>
        </div>
      )}

      {/* Infinite Scroll Trigger */}
      <div ref={loadMoreRef} className="h-4" />

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span
              className="text-sm"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Loading more posts...
            </span>
          </div>
        </div>
      )}

      {/* End of Feed */}
      {!hasMore && blogPosts.length > 0 && (
        <div className="text-center py-8">
          <p
            className="text-sm text-slate-400 dark:text-slate-500"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            You've reached the end
          </p>
        </div>
      )}
    </div>
  )
}
