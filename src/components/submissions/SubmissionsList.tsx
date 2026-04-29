import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { Submission } from '../../types/submission'
import { SubmissionCard } from './SubmissionCard'

type TabFilter = 'all' | 'draft' | 'published'

interface SubmissionsListProps {
  submissions: Submission[]
  isLoading: boolean
  error: Error | null
  isAdmin?: boolean
  onNewSubmission: () => void
  onEditSubmission: (id: string) => void
  onViewSubmission: (id: string) => void
  onDeleteSubmission: (id: string) => void
}

export function SubmissionsList({
  submissions,
  isLoading,
  error,
  isAdmin = false,
  onNewSubmission,
  onEditSubmission,
  onViewSubmission,
  onDeleteSubmission,
}: SubmissionsListProps) {
  const [activeTab, setActiveTab] = useState<TabFilter>('all')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const filteredSubmissions = submissions.filter((s) => activeTab === 'all' || s.status === activeTab)
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
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  const tabs: TabFilter[] = ['all', 'draft', 'published']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-7)' }}>
      <div className="flex items-end justify-between" style={{ gap: 'var(--space-4)', flexWrap: 'wrap' }}>
        <div>
          <div
            className="font-mono uppercase"
            style={{
              fontSize: 'var(--text-mono-xs)',
              letterSpacing: '0.08em',
              color: 'var(--color-accent)',
              fontWeight: 600,
              marginBottom: 'var(--space-2)',
            }}
          >
            Authoring
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 700,
              fontSize: 'var(--text-h2)',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              color: 'var(--color-ink)',
              margin: 0,
            }}
          >
            Submissions
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-ui-base)',
              color: 'var(--color-ink-muted)',
              margin: 0,
              marginTop: 'var(--space-2)',
            }}
          >
            Manage your drafts and published essays.
          </p>
        </div>
        <button
          type="button"
          onClick={onNewSubmission}
          className="font-mono uppercase flex items-center"
          style={{
            gap: 8,
            fontSize: 'var(--text-mono-sm)',
            fontWeight: 600,
            letterSpacing: '0.04em',
            background: 'var(--color-ink)',
            color: 'var(--color-paper)',
            border: 'none',
            borderRadius: 2,
            padding: '10px 16px',
            cursor: 'pointer',
            transition: 'background-color 100ms ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-accent)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-ink)' }}
        >
          <Plus size={14} strokeWidth={1.5} />
          New submission
        </button>
      </div>

      <div className="inline-flex" style={{ gap: 0, alignSelf: 'start' }}>
        {tabs.map((tab, idx) => {
          const isSelected = activeTab === tab
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className="font-mono uppercase"
              aria-pressed={isSelected}
              style={{
                fontSize: 'var(--text-mono-sm)',
                fontWeight: 600,
                letterSpacing: '0.04em',
                padding: '8px 14px',
                background: isSelected ? 'var(--color-ink)' : 'transparent',
                color: isSelected ? 'var(--color-paper)' : 'var(--color-ink-muted)',
                border: '1px solid var(--color-hair)',
                borderLeft: idx === 0 ? '1px solid var(--color-hair)' : 'none',
                cursor: 'pointer',
                transition: 'background-color 100ms ease, color 100ms ease',
              }}
            >
              {tab} <span style={{ opacity: 0.6 }}>({counts[tab]})</span>
            </button>
          )
        })}
      </div>

      {isLoading ? (
        <div
          className="font-mono uppercase"
          style={{
            fontSize: 'var(--text-mono-xs)',
            letterSpacing: '0.08em',
            color: 'var(--color-ink-soft)',
            textAlign: 'center',
            padding: 'var(--space-9) 0',
          }}
        >
          Loading submissions…
        </div>
      ) : error ? (
        <div
          role="alert"
          style={{
            padding: 'var(--space-5)',
            background: 'var(--color-rose-tint)',
            borderLeft: '2px solid var(--color-rose)',
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-ui-base)',
            color: 'var(--color-rose)',
          }}
        >
          {error.message}
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <EmptyState activeTab={activeTab} onNewSubmission={onNewSubmission} />
      ) : (
        <div
          style={{
            display: 'grid',
            gap: 'var(--space-5)',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          }}
        >
          {filteredSubmissions.map((submission) => (
            <SubmissionCard
              key={submission.id}
              submission={submission}
              onEdit={() => onEditSubmission(submission.id)}
              onView={submission.status === 'published' ? () => onViewSubmission(submission.id) : undefined}
              onDelete={(isAdmin || submission.status === 'draft') ? () => handleDelete(submission.id) : undefined}
            />
          ))}
        </div>
      )}

      {deleteConfirm && (
        <div
          role="status"
          style={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            background: 'var(--color-ink)',
            color: 'var(--color-paper)',
            padding: '12px 16px',
            border: '1px solid var(--color-hair)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-mono-sm)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            zIndex: 60,
          }}
        >
          <span>Click delete again to confirm</span>
          <button
            type="button"
            onClick={() => setDeleteConfirm(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-ink-soft)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-mono-xs)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}

function EmptyState({
  activeTab,
  onNewSubmission,
}: {
  activeTab: TabFilter
  onNewSubmission: () => void
}) {
  const messages: Record<TabFilter, { title: string; description: string }> = {
    all:       { title: 'No submissions yet.', description: 'Write your first essay to get started.' },
    draft:     { title: 'No drafts.',           description: 'Start writing something new.' },
    published: { title: 'No published posts.',  description: 'Your published essays will appear here.' },
  }
  const { title, description } = messages[activeTab]

  return (
    <div style={{ padding: 'var(--space-10) var(--space-5)', textAlign: 'center' }}>
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
        {title}
      </h3>
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontStyle: 'italic',
          fontSize: 'var(--text-ui-base)',
          color: 'var(--color-ink-muted)',
          margin: 0,
          marginBottom: 'var(--space-5)',
        }}
      >
        {description}
      </p>
      {activeTab !== 'published' && (
        <button
          type="button"
          onClick={onNewSubmission}
          className="font-mono uppercase inline-flex items-center"
          style={{
            gap: 8,
            fontSize: 'var(--text-mono-sm)',
            fontWeight: 600,
            letterSpacing: '0.04em',
            background: 'var(--color-ink)',
            color: 'var(--color-paper)',
            border: 'none',
            borderRadius: 2,
            padding: '10px 16px',
            cursor: 'pointer',
          }}
        >
          <Plus size={14} strokeWidth={1.5} />
          New submission
        </button>
      )}
    </div>
  )
}
