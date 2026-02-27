import type { BlogPost } from './types'
import { Heart, Bookmark, Share2, MessageCircle } from 'lucide-react'

interface BlogPostCardProps {
  post: BlogPost
  onView?: () => void
  onLike?: () => void
  onBookmark?: () => void
  onShare?: () => void
}

export function BlogPostCard({
  post,
  onView,
  onLike,
  onBookmark,
  onShare,
}: BlogPostCardProps) {
  // Format date
  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  // Get author initials for avatar fallback
  const initials = post.author.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <article
      className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50 hover:shadow-xl hover:shadow-violet-500/10 dark:hover:shadow-violet-500/5 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
    >
      {/* Clickable card area */}
      <button
        onClick={onView}
        className="w-full text-left p-6 pb-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 rounded-t-2xl"
        style={{ padding: 'var(--density-py, 1.5rem)' }}
      >
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-0.5 text-xs font-medium bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 rounded-full"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h2
          className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors leading-tight"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {post.title}
        </h2>

        {/* Excerpt */}
        <p
          className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4 line-clamp-2"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {post.excerpt}
        </p>

        {/* Author and Date */}
        <div className="flex items-center gap-3">
          {post.author.avatarUrl ? (
            <img
              src={post.author.avatarUrl}
              alt={post.author.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-medium ring-2 ring-slate-100 dark:ring-slate-800">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-medium text-slate-900 dark:text-white truncate"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {post.author.name}
            </p>
            <p
              className="text-xs text-slate-500 dark:text-slate-500"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {formattedDate}
            </p>
          </div>
        </div>
      </button>

      {/* Action Bar */}
      <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-500">
          <span className="flex items-center gap-1.5">
            <Heart className="w-4 h-4" />
            <span style={{ fontFamily: 'var(--font-body)' }}>
              {post.likeCount}
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4" />
            <span style={{ fontFamily: 'var(--font-body)' }}>
              {post.commentCount}
            </span>
          </span>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onLike?.()
            }}
            className={`p-2 rounded-full transition-all duration-200 ${
              post.isLiked
                ? 'text-violet-600 bg-violet-50 dark:bg-violet-950/30 dark:text-violet-400'
                : 'text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/30 dark:hover:text-violet-400'
            }`}
            aria-label={post.isLiked ? 'Unlike' : 'Like'}
          >
            <Heart
              className="w-5 h-5"
              fill={post.isLiked ? 'currentColor' : 'none'}
            />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onBookmark?.()
            }}
            className={`p-2 rounded-full transition-all duration-200 ${
              post.isBookmarked
                ? 'text-violet-500 bg-violet-50 dark:bg-violet-950/30'
                : 'text-slate-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/30'
            }`}
            aria-label={post.isBookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            <Bookmark
              className="w-5 h-5"
              fill={post.isBookmarked ? 'currentColor' : 'none'}
            />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onShare?.()
            }}
            className="p-2 rounded-full text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all duration-200"
            aria-label="Share"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </article>
  )
}
