import { useState } from 'react'
import { Plus, FileText, Loader2 } from 'lucide-react'
import type { Submission } from '../../types/submission'
import { SubmissionCard } from './SubmissionCard'

type TabFilter = 'all' | 'draft' | 'published'

interface SubmissionsListProps {
  submissions: Submission[]
  isLoading: boolean
  error: Error | null
  onNewSubmission: () => void
  onEditSubmission: (id: string) => void
  onViewSubmission: (id: string) => void
  onDeleteSubmission: (id: string) => void
}

export function SubmissionsList({
  submissions,
  isLoading,
  error,
  onNewSubmission,
  onEditSubmission,
  onViewSubmission,
  onDeleteSubmission,
}: SubmissionsListProps) {
  const [activeTab, setActiveTab] = useState<TabFilter>('all')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Filter submissions by tab
  const filteredSubmissions = submissions.filter((s) => {
    if (activeTab === 'all') return true
    return s.status === activeTab
  })

  // Count submissions by status
  const counts = {
    all: submissions.length,
    draft: submissions.filter((s) => s.status === 'draft').length,
    published: submissions.filter((s) => s.status === 'published').length,
  }

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      onDeleteSubmission(id)
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(id)
      // Auto-clear after 3 seconds
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            My Submissions
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Manage your blog post drafts and published articles
          </p>
        </div>
        <button
          onClick={onNewSubmission}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Submission</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit">
        {(['all', 'draft', 'published'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            <span className="ml-1.5 text-xs text-slate-400 dark:text-slate-500">
              ({counts[tab]})
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <p className="text-red-600 dark:text-red-400">{error.message}</p>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <EmptyState activeTab={activeTab} onNewSubmission={onNewSubmission} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubmissions.map((submission) => (
            <SubmissionCard
              key={submission.id}
              submission={submission}
              onEdit={() => onEditSubmission(submission.id)}
              onView={
                submission.status === 'published'
                  ? () => onViewSubmission(submission.id)
                  : undefined
              }
              onDelete={() => handleDelete(submission.id)}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Toast */}
      {deleteConfirm && (
        <div className="fixed bottom-4 right-4 bg-slate-900 dark:bg-slate-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
          <span className="text-sm">Click delete again to confirm</span>
          <button
            onClick={() => setDeleteConfirm(null)}
            className="text-xs text-slate-400 hover:text-white"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}

// Empty State Component
function EmptyState({
  activeTab,
  onNewSubmission,
}: {
  activeTab: TabFilter
  onNewSubmission: () => void
}) {
  const messages = {
    all: {
      title: 'No submissions yet',
      description: 'Create your first blog post to get started.',
    },
    draft: {
      title: 'No drafts',
      description: "You don't have any draft posts. Start writing something new!",
    },
    published: {
      title: 'No published posts',
      description: 'Your published posts will appear here.',
    },
  }

  const { title, description } = messages[activeTab]

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
        <FileText className="w-8 h-8 text-slate-400" />
      </div>
      <h3
        className="text-lg font-semibold text-slate-900 dark:text-white mb-2"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {title}
      </h3>
      <p
        className="text-slate-600 dark:text-slate-400 mb-6 max-w-sm"
        style={{ fontFamily: "'Optima', 'Segoe UI', sans-serif" }}
      >
        {description}
      </p>
      {activeTab !== 'published' && (
        <button
          onClick={onNewSubmission}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Submission
        </button>
      )}
    </div>
  )
}
