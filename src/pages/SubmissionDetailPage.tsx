import { useState, useMemo } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import DOMPurify from 'dompurify'
import {
  ArrowLeft,
  Save,
  Send,
  Eye,
  Loader2,
  Check,
  AlertCircle,
  MoreVertical,
  Trash2,
  EyeOff,
} from 'lucide-react'
import { AppShell } from '../components/shell'
import {
  SubmissionEditor,
  TagSelector,
  ImageUploader,
  StatusBadge,
} from '../components/submissions'
import { useTheme, useAuth, useSubmission, useSubmissionDraft } from '../hooks'
import type { SubmissionFormData } from '../types/submission'

export function SubmissionDetailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams<{ id: string }>()
  useTheme()
  const { user, signOut } = useAuth()
  const { submission, isLoading, error, publish, unpublish, remove } =
    useSubmission(id)

  const [showMenu, setShowMenu] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const navigationItems = [
    { label: 'Home', href: '/kbw-notes/home', isActive: false },
    {
      label: 'Submissions',
      href: '/kbw-notes/submissions',
      isActive: location.pathname.startsWith('/kbw-notes/submissions'),
    },
  ]

  const handleNavigate = (href: string) => {
    navigate(href)
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  const handleSignIn = () => {
    navigate('/', { state: { from: location.pathname } })
  }

  // Initial form data from submission
  const initialData = useMemo<SubmissionFormData>(
    () => ({
      title: submission?.title ?? '',
      excerpt: submission?.excerpt ?? '',
      content: submission?.content ?? '',
      coverImageUrl: submission?.coverImageUrl ?? null,
      tags: submission?.tags ?? [],
    }),
    [submission]
  )

  // Auto-save draft hook
  const {
    formData,
    updateField,
    isDirty,
    isSaving,
    lastSaved,
    saveNow,
    error: saveError,
  } = useSubmissionDraft({
    submissionId: id ?? '',
    initialData,
    autoSaveInterval: 30000, // 30 seconds
  })

  const handlePublish = async () => {
    if (!submission) return

    // Validate required fields
    if (!formData.title.trim()) {
      setPublishError('Please add a title before publishing')
      return
    }
    if (!formData.content.trim()) {
      setPublishError('Please add some content before publishing')
      return
    }

    setIsPublishing(true)
    setPublishError(null)

    try {
      // Save any pending changes first — check the returned error directly
      // (not React state, which would be stale until next render)
      const saveErr = await saveNow()
      if (saveErr) {
        setPublishError('Failed to save changes before publishing. Please try again.')
        return
      }

      const result = await publish()
      if (!result) {
        setPublishError('Failed to publish. Please try again.')
      }
    } finally {
      setIsPublishing(false)
    }
  }

  const handleUnpublish = async () => {
    if (!submission) return
    await unpublish()
    setShowMenu(false)
  }

  const handleDelete = async () => {
    if (!submission) return
    const confirmed = window.confirm(
      'Are you sure you want to delete this submission? This cannot be undone.'
    )
    if (confirmed) {
      await remove()
      navigate('/kbw-notes/submissions')
    }
  }

  // User display info
  const userDisplay = user
    ? {
        name:
          user.user_metadata?.full_name ??
          user.user_metadata?.name ??
          user.email ??
          'User',
        avatarUrl: user.user_metadata?.avatar_url,
      }
    : undefined

  // Require authentication
  if (!user) {
    return (
      <AppShell
        navigationItems={navigationItems}
        user={userDisplay}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        onSignIn={handleSignIn}
      >
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <h1
            className="text-2xl font-bold text-slate-900 dark:text-white mb-4"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Sign in to edit submissions
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            You need to be logged in to edit blog submissions.
          </p>
          <button
            onClick={handleSignIn}
            className="px-6 py-3 text-sm font-medium rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </AppShell>
    )
  }

  if (isLoading) {
    return (
      <AppShell
        navigationItems={navigationItems}
        user={userDisplay}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        onSignIn={handleSignIn}
      >
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin mb-4" />
          <p className="text-slate-600 dark:text-slate-400">
            Loading submission...
          </p>
        </div>
      </AppShell>
    )
  }

  if (error || !submission) {
    return (
      <AppShell
        navigationItems={navigationItems}
        user={userDisplay}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        onSignIn={handleSignIn}
      >
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h1
            className="text-2xl font-bold text-slate-900 dark:text-white mb-2"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Submission not found
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {error?.message ?? "This submission doesn't exist or you don't have access to it."}
          </p>
          <button
            onClick={() => navigate('/kbw-notes/submissions')}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Back to Submissions
          </button>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell
      navigationItems={navigationItems}
      user={userDisplay}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      onSignIn={handleSignIn}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/kbw-notes/submissions')}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              aria-label="Back to submissions"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1
                  className="text-xl font-bold text-slate-900 dark:text-white"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {submission.status === 'draft' ? 'Edit Draft' : 'Edit Post'}
                </h1>
                <StatusBadge status={submission.status} />
              </div>
              {/* Save status */}
              <p className="text-xs text-slate-500 mt-0.5">
                {isSaving ? (
                  <span className="flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Saving...
                  </span>
                ) : isDirty ? (
                  'Unsaved changes'
                ) : lastSaved ? (
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-500" />
                    Saved
                  </span>
                ) : (
                  'No changes'
                )}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={saveNow}
              disabled={!isDirty || isSaving}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Save</span>
            </button>

            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                showPreview
                  ? 'border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-700 dark:bg-violet-950/30 dark:text-violet-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Preview</span>
            </button>

            {submission.status === 'draft' ? (
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors disabled:opacity-50"
              >
                {isPublishing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Publish
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 z-20 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1">
                      <button
                        onClick={handleUnpublish}
                        className="w-full px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                      >
                        <EyeOff className="w-4 h-4" />
                        Unpublish
                      </button>
                      <button
                        onClick={handleDelete}
                        className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Error messages */}
        {(publishError || saveError) && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {publishError || saveError?.message}
          </div>
        )}

        {/* Preview Mode */}
        {showPreview ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
            {formData.coverImageUrl && (
              <div className="aspect-video mb-6 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={formData.coverImageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <h1
              className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {formData.title || 'Untitled'}
            </h1>
            {formData.excerpt && (
              <p
                className="text-lg text-slate-600 dark:text-slate-400 mb-6"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {formData.excerpt}
              </p>
            )}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 text-sm font-medium bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div
              className="prose prose-slate dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formData.content) }}
            />
          </div>
        ) : (
          /* Edit Mode */
          <div className="space-y-6">
            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Cover Image
              </label>
              <ImageUploader
                currentImageUrl={formData.coverImageUrl}
                onImageUploaded={(url) => updateField('coverImageUrl', url)}
                onImageRemoved={() => updateField('coverImageUrl', null)}
              />
            </div>

            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Title
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Enter your post title..."
                className="w-full px-4 py-3 text-lg font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-slate-900 dark:text-white placeholder-slate-400"
                style={{ fontFamily: 'var(--font-heading)' }}
              />
            </div>

            {/* Excerpt */}
            <div>
              <label
                htmlFor="excerpt"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Excerpt
                <span className="font-normal text-slate-500 ml-1">
                  (Brief summary for previews)
                </span>
              </label>
              <textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => updateField('excerpt', e.target.value)}
                placeholder="Write a brief summary of your post..."
                rows={2}
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-slate-900 dark:text-white placeholder-slate-400 resize-none"
                style={{ fontFamily: 'var(--font-body)' }}
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Tags
              </label>
              <TagSelector
                selectedTags={formData.tags}
                onChange={(tags) => updateField('tags', tags)}
              />
            </div>

            {/* Content Editor */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Content
              </label>
              <SubmissionEditor
                content={formData.content}
                onChange={(content) => updateField('content', content)}
                placeholder="Write your post content here..."
              />
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
