import { useState } from 'react'
import type { Comment } from './types'
import { Heart, MessageCircle, Flag, ShieldCheck, Clock, Trash2, X, Check } from 'lucide-react'
import { CommentForm } from './CommentForm'

interface CommentThreadProps {
  comment: Comment
  depth?: number
  /** Current user's ID (for determining edit/delete permissions) */
  currentUserId?: string
  /** Whether the current user has reacted to this comment */
  hasReacted?: boolean
  onReply?: (commentId: string, content: string) => Promise<void>
  onDelete?: (commentId: string) => Promise<void>
  onReact?: (commentId: string) => void
  onReport?: (commentId: string) => void
  /** Set of comment IDs the user has reacted to (for nested comments) */
  userReactions?: Set<string>
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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
  const isOwnComment = currentUserId === comment.commenter.id
  const isDeleted = comment.content === '[This comment has been deleted]'
  const isPendingReview = !comment.isModerated && isOwnComment

  const [isReplying, setIsReplying] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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
    setIsSubmitting(true)
    try {
      await onDelete?.(comment.id)
      setShowDeleteConfirm(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Determine if nested comment has user reaction
  const getNestedHasReacted = (commentId: string) => {
    return userReactions?.has(commentId) ?? false
  }

  return (
    <div className={`${isNested ? 'ml-6 sm:ml-10 border-l-2 border-slate-200 dark:border-slate-700 pl-4 sm:pl-6' : ''}`}>
      <div className="py-4">
        {/* Comment header */}
        <div className="flex items-start gap-3">
          {comment.commenter.avatar ? (
            <img
              src={comment.commenter.avatar}
              alt={comment.commenter.name}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0 object-cover"
            />
          ) : (
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 shrink-0 flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {comment.commenter.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                {comment.commenter.name}
              </span>
              <span className="text-slate-400 dark:text-slate-500 text-xs sm:text-sm">
                {formatRelativeTime(comment.createdAt)}
              </span>
              {comment.isModerated && !isDeleted && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs">
                  <ShieldCheck className="w-3 h-3" strokeWidth={2} />
                  <span className="hidden sm:inline">Verified</span>
                </span>
              )}
              {isPendingReview && !isDeleted && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs">
                  <Clock className="w-3 h-3" strokeWidth={2} />
                  <span className="hidden sm:inline">Pending Review</span>
                </span>
              )}
              {isOwnComment && !isDeleted && (
                <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs">
                  You
                </span>
              )}
            </div>

            {/* Comment content */}
            <p className={`mt-2 text-sm sm:text-base leading-relaxed ${
              isDeleted
                ? 'text-slate-400 dark:text-slate-500 italic'
                : 'text-slate-700 dark:text-slate-300'
            }`}>
              {comment.content}
            </p>

            {/* Comment actions */}
            {!isDeleted && (
              <div className="mt-3 flex items-center gap-1 sm:gap-2 flex-wrap">
                <button
                  onClick={() => onReact?.(comment.id)}
                  className={`inline-flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm transition-colors ${
                    hasReacted
                      ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-600 dark:hover:text-violet-400'
                  }`}
                  aria-label={hasReacted ? 'Unlike comment' : 'Like comment'}
                  aria-pressed={hasReacted}
                >
                  <Heart
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${hasReacted ? 'fill-current' : ''}`}
                    strokeWidth={1.5}
                  />
                  {comment.reactions > 0 && (
                    <span className="font-medium">{comment.reactions}</span>
                  )}
                </button>

                {canNestFurther && (
                  <button
                    onClick={() => setIsReplying(!isReplying)}
                    className={`inline-flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm transition-colors ${
                      isReplying
                        ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400'
                    }`}
                    aria-label="Reply to comment"
                    aria-expanded={isReplying}
                  >
                    <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
                    <span>Reply</span>
                  </button>
                )}

                {isOwnComment && (
                  showDeleteConfirm ? (
                    <div className="inline-flex items-center gap-1 ml-auto">
                      <span className="text-xs text-slate-500 dark:text-slate-400 mr-1">Delete?</span>
                      <button
                        onClick={handleDelete}
                        disabled={isSubmitting}
                        className="p-1.5 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        aria-label="Confirm delete"
                      >
                        <Check className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        aria-label="Cancel delete"
                      >
                        <X className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm text-slate-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                      aria-label="Delete comment"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  )
                )}

                {!isOwnComment && (
                  <button
                    onClick={() => onReport?.(comment.id)}
                    className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm text-slate-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400 transition-colors ml-auto"
                    aria-label="Report comment"
                  >
                    <Flag className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
                  </button>
                )}
              </div>
            )}

            {/* Reply form */}
            {isReplying && (
              <div className="mt-4">
                <CommentForm
                  placeholder={`Reply to ${comment.commenter.name}...`}
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

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-0">
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
