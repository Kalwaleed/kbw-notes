import { useState, useMemo } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import DOMPurify from 'dompurify'
import {
  ArrowLeft,
  Save,
  Send,
  Eye,
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
import { useAuth, useSubmission, useSubmissionDraft } from '../hooks'
import type { SubmissionFormData } from '../types/submission'

/**
 * Renders pre-sanitized HTML preview. Caller is responsible for running
 * the input through DOMPurify before passing it here.
 */
function SanitizedPreview({ html }: { html: string }) {
  return (
    <div
      className="prose-article kbw-prose-section"
      // Input is DOMPurify-sanitized in the parent before reaching here.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export function SubmissionDetailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams<{ id: string }>()
  const { user, isAdmin, signOut } = useAuth()
  const { submission, isLoading, error, publish, unpublish, remove } = useSubmission(id)

  const isPublished = submission?.status === 'published'
  const editsRemaining = submission?.editsRemaining ?? 0
  const editLocked = !isAdmin && isPublished && editsRemaining <= 0

  const [showMenu, setShowMenu] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const navigationItems = [
    { label: 'Home',          href: '/kbw-notes/home',          isActive: false },
    { label: 'Submissions',   href: '/kbw-notes/submissions',   isActive: location.pathname.startsWith('/kbw-notes/submissions') },
    { label: 'Notifications', href: '/kbw-notes/notifications', isActive: false },
    { label: 'Settings',      href: '/kbw-notes/settings',      isActive: false },
  ]

  const handleNavigate = (href: string) => navigate(href)
  const handleLogout = async () => { await signOut(); navigate('/') }
  const handleSignIn = () => navigate('/', { state: { from: location.pathname } })

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
    autoSaveInterval: 30000,
    autoSaveEnabled: !isPublished || isAdmin,
  })

  const sanitizedPreviewHtml = useMemo(
    () => DOMPurify.sanitize(formData.content),
    [formData.content]
  )

  const handlePublish = async () => {
    if (!submission) return
    if (!formData.title.trim()) { setPublishError('Add a title before publishing'); return }
    if (!formData.content.trim()) { setPublishError('Add some content before publishing'); return }
    setIsPublishing(true)
    setPublishError(null)
    try {
      const saveErr = await saveNow()
      if (saveErr) {
        setPublishError('Failed to save changes before publishing. Please try again.')
        return
      }
      const result = await publish()
      if (!result) setPublishError('Failed to publish. Please try again.')
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
    const confirmed = window.confirm('Delete this submission? This cannot be undone.')
    if (confirmed) {
      await remove()
      navigate('/kbw-notes/submissions')
    }
  }

  const userDisplay = user
    ? {
        name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email ?? 'User',
        email: user.email ?? undefined,
        avatarUrl: user.user_metadata?.avatar_url,
      }
    : undefined

  if (!user) {
    return (
      <AppShell {...{ navigationItems, user: userDisplay, onNavigate: handleNavigate, onLogout: handleLogout, onSignIn: handleSignIn }}>
        <CenteredMessage title="Sign in to edit submissions.">
          <PrimaryButton onClick={handleSignIn}>Sign in</PrimaryButton>
        </CenteredMessage>
      </AppShell>
    )
  }

  if (isLoading) {
    return (
      <AppShell {...{ navigationItems, user: userDisplay, onNavigate: handleNavigate, onLogout: handleLogout, onSignIn: handleSignIn }}>
        <div
          style={{
            padding: 'var(--space-9) 0',
            textAlign: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-mono-xs)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--color-ink-soft)',
          }}
        >
          Loading submission…
        </div>
      </AppShell>
    )
  }

  if (error || !submission) {
    return (
      <AppShell {...{ navigationItems, user: userDisplay, onNavigate: handleNavigate, onLogout: handleLogout, onSignIn: handleSignIn }}>
        <CenteredMessage
          icon={AlertCircle}
          kicker="Not found"
          title="Submission not found."
          description={error?.message ?? 'This submission does not exist or you do not have access to it.'}
        >
          <PrimaryButton onClick={() => navigate('/kbw-notes/submissions')}>Back to submissions</PrimaryButton>
        </CenteredMessage>
      </AppShell>
    )
  }

  return (
    <AppShell {...{ navigationItems, user: userDisplay, onNavigate: handleNavigate, onLogout: handleLogout, onSignIn: handleSignIn }} containerWidth="wide">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-7)' }}>
        <div className="flex flex-wrap items-end justify-between" style={{ gap: 'var(--space-4)' }}>
          <div>
            <button
              type="button"
              onClick={() => navigate('/kbw-notes/submissions')}
              className="font-mono uppercase inline-flex items-center"
              style={{
                gap: 6,
                fontSize: 'var(--text-mono-xs)',
                letterSpacing: '0.04em',
                color: 'var(--color-ink-muted)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                marginBottom: 'var(--space-3)',
              }}
              aria-label="Back to submissions"
            >
              <ArrowLeft size={14} strokeWidth={1.5} />
              Submissions
            </button>
            <div className="flex items-center" style={{ gap: 'var(--space-3)' }}>
              <h1
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 700,
                  fontSize: 'var(--text-h2)',
                  lineHeight: 1.15,
                  letterSpacing: '-0.02em',
                  color: 'var(--color-ink)',
                  margin: 0,
                }}
              >
                {submission.status === 'draft' ? 'Edit draft.' : 'Edit post.'}
              </h1>
              <StatusBadge status={submission.status} />
            </div>
            <p
              className="font-mono uppercase"
              style={{
                fontSize: 'var(--text-mono-xs)',
                letterSpacing: '0.04em',
                color: isSaving ? 'var(--color-ink-muted)' : isDirty ? 'var(--color-amber)' : lastSaved ? 'var(--color-accent)' : 'var(--color-ink-soft)',
                margin: 0,
                marginTop: 'var(--space-2)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {isSaving ? '· Saving…' : isDirty ? '· Unsaved changes' : lastSaved ? <><Check size={12} strokeWidth={1.5} /> Saved</> : '· No changes'}
            </p>
            {isPublished && !isAdmin && (
              <p
                className="font-mono uppercase"
                style={{
                  fontSize: 'var(--text-mono-xs)',
                  letterSpacing: '0.04em',
                  color: editsRemaining === 0 ? 'var(--color-rose)' : 'var(--color-amber)',
                  margin: 0,
                  marginTop: 4,
                }}
              >
                {editsRemaining === 0
                  ? '⟁ Edit cap reached — contact an admin'
                  : `${editsRemaining} edit${editsRemaining === 1 ? '' : 's'} remaining`}
              </p>
            )}
          </div>

          <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
            <SecondaryButton onClick={() => saveNow()} disabled={!isDirty || isSaving || editLocked} icon={Save}>
              Save
            </SecondaryButton>
            <SecondaryButton onClick={() => setShowPreview(!showPreview)} active={showPreview} icon={Eye}>
              Preview
            </SecondaryButton>
            {submission.status === 'draft' ? (
              <PrimaryButton onClick={handlePublish} disabled={isPublishing} icon={Send}>
                {isPublishing ? 'Publishing…' : 'Publish'}
              </PrimaryButton>
            ) : isAdmin ? (
              <div style={{ position: 'relative' }}>
                <SecondaryButton onClick={() => setShowMenu(!showMenu)} icon={MoreVertical}>
                  More
                </SecondaryButton>
                {showMenu && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setShowMenu(false)} />
                    <div
                      className="drawer-enter"
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: '100%',
                        marginTop: 4,
                        width: 160,
                        background: 'var(--color-paper-raised)',
                        border: '1px solid var(--color-hair)',
                        boxShadow: '6px 6px 0 0 var(--color-hair)',
                        padding: '4px 0',
                        zIndex: 20,
                      }}
                    >
                      <DropdownItem onClick={handleUnpublish} icon={EyeOff}>Unpublish</DropdownItem>
                      <DropdownItem onClick={handleDelete} icon={Trash2} destructive>Delete</DropdownItem>
                    </div>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {(publishError || saveError) && (
          <div
            role="alert"
            style={{
              padding: 'var(--space-3) var(--space-4)',
              background: 'var(--color-rose-tint)',
              borderLeft: '2px solid var(--color-rose)',
              fontFamily: 'var(--font-sans)',
              fontStyle: 'italic',
              fontSize: 'var(--text-ui-sm)',
              color: 'var(--color-rose)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
            }}
          >
            <AlertCircle size={14} strokeWidth={1.5} />
            {publishError || saveError?.message}
          </div>
        )}

        {showPreview ? (
          <div
            style={{
              background: 'var(--color-paper-raised)',
              border: '1px solid var(--color-hair)',
              padding: 'var(--space-7)',
            }}
          >
            {formData.coverImageUrl && (
              <div
                style={{
                  aspectRatio: '16 / 9',
                  background: 'var(--color-paper-sunken)',
                  border: '1px solid var(--color-hair)',
                  marginBottom: 'var(--space-6)',
                  overflow: 'hidden',
                }}
              >
                <img src={formData.coverImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontWeight: 700,
                fontSize: 'var(--text-h1)',
                lineHeight: 1.05,
                letterSpacing: '-0.03em',
                color: 'var(--color-ink)',
                margin: 0,
                marginBottom: 'var(--space-4)',
              }}
            >
              {formData.title || 'Untitled'}
            </h1>
            {formData.excerpt && (
              <p
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontStyle: 'italic',
                  fontSize: 22,
                  lineHeight: 1.4,
                  color: 'var(--color-ink-muted)',
                  margin: 0,
                  marginBottom: 'var(--space-7)',
                }}
              >
                {formData.excerpt}
              </p>
            )}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap" style={{ gap: 8, marginBottom: 'var(--space-7)' }}>
                {formData.tags.map((tag) => (
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
            <SanitizedPreview html={sanitizedPreviewHtml} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <Field label="Cover image">
              <ImageUploader
                currentImageUrl={formData.coverImageUrl}
                onImageUploaded={(url) => updateField('coverImageUrl', url)}
                onImageRemoved={() => updateField('coverImageUrl', null)}
              />
            </Field>

            <Field label="Title" htmlFor="title">
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Title of the piece."
                style={{
                  width: '100%',
                  padding: 'var(--space-3) var(--space-4)',
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'var(--text-section)',
                  fontWeight: 600,
                  color: 'var(--color-ink)',
                  background: 'var(--color-paper-raised)',
                  border: '1px solid var(--color-hair)',
                  borderRadius: 0,
                  outline: 'none',
                }}
              />
            </Field>

            <Field label="Excerpt" htmlFor="excerpt" hint="Brief summary for previews.">
              <textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => updateField('excerpt', e.target.value)}
                placeholder="A line or two."
                rows={2}
                style={{
                  width: '100%',
                  padding: 'var(--space-3) var(--space-4)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'var(--text-ui-base)',
                  color: 'var(--color-ink)',
                  background: 'var(--color-paper-raised)',
                  border: '1px solid var(--color-hair)',
                  borderRadius: 0,
                  resize: 'vertical',
                  outline: 'none',
                }}
              />
            </Field>

            <Field label="Tags">
              <TagSelector selectedTags={formData.tags} onChange={(tags) => updateField('tags', tags)} />
            </Field>

            <Field label="Content">
              <SubmissionEditor
                content={formData.content}
                onChange={(content) => updateField('content', content)}
                placeholder="Write your post content here."
              />
            </Field>
          </div>
        )}
      </div>
    </AppShell>
  )
}

function Field({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string
  hint?: string
  htmlFor?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="font-mono uppercase"
        style={{
          display: 'block',
          fontSize: 'var(--text-mono-xs)',
          letterSpacing: '0.08em',
          color: 'var(--color-ink-soft)',
          fontWeight: 600,
          marginBottom: 'var(--space-2)',
        }}
      >
        {label}
        {hint && (
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontStyle: 'italic',
              fontWeight: 400,
              textTransform: 'none',
              letterSpacing: 0,
              marginLeft: 8,
              color: 'var(--color-ink-soft)',
            }}
          >
            {hint}
          </span>
        )}
      </label>
      {children}
    </div>
  )
}

function PrimaryButton({
  onClick,
  disabled,
  icon: Icon,
  children,
}: {
  onClick: () => void
  disabled?: boolean
  icon?: typeof Send
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="font-mono uppercase inline-flex items-center"
      style={{
        gap: 6,
        fontSize: 'var(--text-mono-sm)',
        fontWeight: 600,
        letterSpacing: '0.04em',
        background: 'var(--color-ink)',
        color: 'var(--color-paper)',
        border: 'none',
        borderRadius: 2,
        padding: '10px 16px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {Icon && <Icon size={14} strokeWidth={1.5} />}
      {children}
    </button>
  )
}

function SecondaryButton({
  onClick,
  disabled,
  active,
  icon: Icon,
  children,
}: {
  onClick: () => void
  disabled?: boolean
  active?: boolean
  icon?: typeof Save
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="font-mono uppercase inline-flex items-center"
      style={{
        gap: 6,
        fontSize: 'var(--text-mono-sm)',
        fontWeight: 600,
        letterSpacing: '0.04em',
        background: active ? 'var(--color-accent-tint)' : 'transparent',
        color: 'var(--color-ink)',
        border: '1px solid var(--color-hair)',
        borderRadius: 2,
        padding: '9px 14px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {Icon && <Icon size={14} strokeWidth={1.5} />}
      {children}
    </button>
  )
}

function DropdownItem({
  onClick,
  destructive,
  icon: Icon,
  children,
}: {
  onClick: () => void
  destructive?: boolean
  icon: typeof EyeOff
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center"
      style={{
        gap: 8,
        width: '100%',
        textAlign: 'left',
        padding: '8px 12px',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--text-ui-sm)',
        fontWeight: 500,
        color: destructive ? 'var(--color-rose)' : 'var(--color-ink)',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = destructive ? 'var(--color-rose-tint)' : 'var(--color-accent-tint)'
      }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
    >
      <Icon size={14} strokeWidth={1.5} />
      {children}
    </button>
  )
}

function CenteredMessage({
  icon: Icon,
  kicker,
  title,
  description,
  children,
}: {
  icon?: typeof AlertCircle
  kicker?: string
  title: string
  description?: string
  children?: React.ReactNode
}) {
  return (
    <div style={{ padding: 'var(--space-9) 0', textAlign: 'center' }}>
      {Icon && <Icon size={24} strokeWidth={1.5} style={{ color: 'var(--color-rose)', display: 'block', margin: '0 auto var(--space-3)' }} />}
      {kicker && (
        <div
          className="font-mono uppercase"
          style={{ fontSize: 'var(--text-mono-xs)', letterSpacing: '0.08em', color: 'var(--color-accent)', fontWeight: 600, marginBottom: 'var(--space-2)' }}
        >
          {kicker}
        </div>
      )}
      <h1
        style={{
          fontFamily: 'var(--font-serif)',
          fontWeight: 700,
          fontSize: 'var(--text-h2)',
          color: 'var(--color-ink)',
          margin: 0,
          marginBottom: description ? 'var(--space-3)' : 'var(--space-5)',
        }}
      >
        {title}
      </h1>
      {description && (
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontStyle: 'italic',
            fontSize: 'var(--text-ui-base)',
            color: 'var(--color-ink-muted)',
            margin: 0,
            marginBottom: 'var(--space-5)',
            maxWidth: '52ch',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          {description}
        </p>
      )}
      {children}
    </div>
  )
}
