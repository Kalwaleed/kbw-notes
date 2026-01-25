import { Edit2, Trash2, Eye, MoreVertical } from 'lucide-react'
import { useState } from 'react'
import type { Submission } from '../../types/submission'
import { StatusBadge } from './StatusBadge'

interface SubmissionCardProps {
  submission: Submission
  onEdit?: () => void
  onView?: () => void
  onDelete?: () => void
}

export function SubmissionCard({
  submission,
  onEdit,
  onView,
  onDelete,
}: SubmissionCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  // Format relative time
  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return formatDate(dateStr)
  }

  const title = submission.title || 'Untitled'
  const excerpt = submission.excerpt || 'No excerpt yet...'

  return (
    <article className="group relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Cover Image Placeholder */}
      {submission.coverImageUrl && (
        <div className="aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <img
            src={submission.coverImageUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-4 sm:p-5">
        {/* Header: Status + Menu */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <StatusBadge status={submission.status} />
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              aria-label="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-20 w-32 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1">
                  {onEdit && (
                    <button
                      onClick={() => {
                        setShowMenu(false)
                        onEdit()
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                  {submission.status === 'published' && onView && (
                    <button
                      onClick={() => {
                        setShowMenu(false)
                        onView()
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        setShowMenu(false)
                        onDelete()
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Title */}
        <h3
          className={`text-lg font-semibold mb-2 leading-tight ${
            submission.title
              ? 'text-slate-900 dark:text-white'
              : 'text-slate-400 dark:text-slate-500 italic'
          }`}
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {title}
        </h3>

        {/* Excerpt */}
        <p
          className={`text-sm mb-3 line-clamp-2 ${
            submission.excerpt
              ? 'text-slate-600 dark:text-slate-400'
              : 'text-slate-400 dark:text-slate-500 italic'
          }`}
          style={{ fontFamily: "'Optima', 'Segoe UI', sans-serif" }}
        >
          {excerpt}
        </p>

        {/* Tags */}
        {submission.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {submission.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs font-medium bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 rounded-full"
              >
                {tag}
              </span>
            ))}
            {submission.tags.length > 3 && (
              <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full">
                +{submission.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer: Date */}
        <div
          className="text-xs text-slate-500 dark:text-slate-500"
          style={{ fontFamily: "'Optima', 'Segoe UI', sans-serif" }}
        >
          {submission.status === 'published' && submission.publishedAt ? (
            <span>Published {formatDate(submission.publishedAt)}</span>
          ) : (
            <span>Edited {formatRelativeTime(submission.updatedAt)}</span>
          )}
        </div>
      </div>

      {/* Click overlay for editing */}
      <button
        onClick={onEdit}
        className="absolute inset-0 z-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-inset rounded-xl"
        aria-label={`Edit ${title}`}
      />
    </article>
  )
}
