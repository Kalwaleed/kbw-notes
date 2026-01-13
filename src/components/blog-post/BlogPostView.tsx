import { useState } from 'react'
import type { BlogPostCommentsProps, Comment } from './types'
import { CommentThread } from './CommentThread'
import { CommentForm } from './CommentForm'
import { BlogPostSkeleton, CommentSkeleton } from './BlogPostSkeleton'
import { Twitter, Linkedin, Link2, Clock, MessageCircle, ChevronDown } from 'lucide-react'

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function parseMarkdownBody(body: string): React.ReactNode[] {
  const lines = body.split('\n')
  const elements: React.ReactNode[] = []
  let currentParagraph: string[] = []
  let key = 0

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      elements.push(
        <p key={key++} className="text-slate-700 dark:text-slate-300 leading-relaxed text-base sm:text-lg">
          {currentParagraph.join(' ')}
        </p>
      )
      currentParagraph = []
    }
  }

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed.startsWith('## ')) {
      flushParagraph()
      elements.push(
        <h2 key={key++} className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white mt-8 mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {trimmed.slice(3)}
        </h2>
      )
    } else if (trimmed === '') {
      flushParagraph()
    } else {
      currentParagraph.push(trimmed)
    }
  }

  flushParagraph()
  return elements
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

  // Filter comments: show approved OR show to author if pending review
  const filterVisibleComments = (commentsList: Comment[]): Comment[] => {
    return commentsList
      .filter(comment => comment.isModerated || comment.commenter.id === currentUserId)
      .map(comment => ({
        ...comment,
        replies: filterVisibleComments(comment.replies || [])
      }))
  }

  const visibleComments = filterVisibleComments(comments)

  const totalComments = visibleComments.reduce((acc, comment) => {
    const countReplies = (c: Comment): number => {
      return 1 + (c.replies?.reduce((sum, r) => sum + countReplies(r), 0) || 0)
    }
    return acc + countReplies(comment)
  }, 0)

  const handleLoadMore = async () => {
    setIsLoadingMore(true)
    try {
      await onLoadMore?.()
    } finally {
      setIsLoadingMore(false)
    }
  }

  // Show skeleton while loading
  if (isLoading) {
    return <BlogPostSkeleton />
  }

  return (
    <div className="min-h-screen bg-slate-300 dark:bg-slate-900 py-8 sm:py-12 md:py-16 px-4 sm:px-6">
      {/* Elevated article card */}
      <article className="max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-400/30 dark:shadow-slate-950/50 overflow-hidden">
        {/* Decorative top gradient bar */}
        <div className="h-1.5 bg-gradient-to-r from-violet-500 via-indigo-500 to-violet-600" />

        <div className="p-8 sm:p-12 md:p-16 lg:p-20">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
            {blogPost.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-indigo-100 dark:bg-violet-950 text-indigo-700 dark:text-violet-600"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Headline */}
          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white leading-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {blogPost.headline}
          </h1>

          {/* Subheader */}
          <p className="mt-3 sm:mt-4 text-lg sm:text-xl text-slate-600 dark:text-white leading-relaxed">
            {blogPost.subheader}
          </p>

          {/* Author and meta info */}
          <div className="mt-8 sm:mt-10 pb-6 sm:pb-8 border-b border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {blogPost.author.name}
              </span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span>{formatDate(blogPost.publishedAt)}</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                {blogPost.readingTime} min read
              </span>
            </div>

            {/* Share buttons */}
            <div className="flex items-center gap-1 mt-4">
              <button
                onClick={onShareTwitter}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title="Share on Twitter/X"
                aria-label="Share on Twitter/X"
              >
                <Twitter className="w-4 h-4" strokeWidth={1.5} />
              </button>
              <button
                onClick={onShareLinkedIn}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title="Share on LinkedIn"
                aria-label="Share on LinkedIn"
              >
                <Linkedin className="w-4 h-4" strokeWidth={1.5} />
              </button>
              <button
                onClick={onCopyLink}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title="Copy link"
                aria-label="Copy link to clipboard"
              >
                <Link2 className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Article body */}
          <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
            {parseMarkdownBody(blogPost.body)}
          </div>

          {/* Share CTA at bottom */}
          <div className="mt-10 sm:mt-12 p-4 sm:p-6 rounded-xl bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 border border-violet-100 dark:border-violet-800/50">
            <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base font-medium mb-3">
              Enjoyed this article? Share it with your network.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={onShareTwitter}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs sm:text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
              >
                <Twitter className="w-4 h-4" strokeWidth={1.5} />
                <span className="hidden sm:inline">Twitter</span>
              </button>
              <button
                onClick={onShareLinkedIn}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs sm:text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
              >
                <Linkedin className="w-4 h-4" strokeWidth={1.5} />
                <span className="hidden sm:inline">LinkedIn</span>
              </button>
              <button
                onClick={onCopyLink}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Link2 className="w-4 h-4" strokeWidth={1.5} />
                <span className="hidden sm:inline">Copy Link</span>
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* Comments section */}
      <section className="max-w-3xl mx-auto mt-8 sm:mt-10 bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-400/30 dark:shadow-slate-950/50 overflow-hidden">
        <div className="p-8 sm:p-12 md:p-16 lg:p-20">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-violet-600 dark:text-violet-400" strokeWidth={1.5} />
            <h2
              className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Discussion
              <span className="ml-2 text-slate-400 dark:text-slate-500 font-normal text-base">
                ({totalComments})
              </span>
            </h2>
          </div>

          {/* Comment form for new top-level comments */}
          <div className="mb-6 sm:mb-8">
            <CommentForm
              placeholder="Share your thoughts..."
              onSubmit={onAddComment}
              moderationError={moderationError}
              onClearModerationError={onClearModerationError}
            />
          </div>

          {visibleComments.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-slate-500 dark:text-slate-400">
                No comments yet. Be the first to share your thoughts.
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
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

              {/* Load more button */}
              {hasMoreComments && (
                <div className="mt-6 text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoadingMore ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" strokeWidth={1.5} />
                        Load more comments
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Loading skeleton for more comments */}
              {isLoadingMore && (
                <div className="mt-4 space-y-4">
                  <CommentSkeleton />
                  <CommentSkeleton />
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}
