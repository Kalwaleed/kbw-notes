import { useNavigate, useLocation } from 'react-router-dom'
import { AppShell } from '../components/shell'
import { SubmissionsList } from '../components/submissions'
import { useAuth, useSubmissions } from '../hooks'

export function SubmissionsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAdmin, signOut } = useAuth()
  const { submissions, isLoading, error, create, remove } = useSubmissions()

  const navigationItems = [
    { label: 'Home',          href: '/kbw-notes/home',          isActive: false },
    { label: 'Submissions',   href: '/kbw-notes/submissions',   isActive: location.pathname.startsWith('/kbw-notes/submissions') },
    { label: 'Notifications', href: '/kbw-notes/notifications', isActive: false },
    { label: 'Settings',      href: '/kbw-notes/settings',      isActive: false },
  ]

  const handleNavigate = (href: string) => navigate(href)
  const handleLogout = async () => { await signOut(); navigate('/') }
  const handleSignIn = () => navigate('/', { state: { from: location.pathname } })

  const handleNewSubmission = async () => {
    const submission = await create()
    if (submission) navigate(`/kbw-notes/submissions/${submission.id}`)
  }

  const handleEditSubmission = (id: string) => navigate(`/kbw-notes/submissions/${id}`)
  const handleViewSubmission = (id: string) => navigate(`/kbw-notes/submissions/${id}`)
  const handleDeleteSubmission = async (id: string) => { await remove(id) }

  const userDisplay = user
    ? {
        name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email ?? 'User',
        email: user.email ?? undefined,
        avatarUrl: user.user_metadata?.avatar_url,
      }
    : undefined

  if (!user) {
    return (
      <AppShell
        navigationItems={navigationItems}
        user={userDisplay}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        onSignIn={handleSignIn}
      >
        <div style={{ padding: 'var(--space-9) 0', textAlign: 'center' }}>
          <div
            className="font-mono uppercase"
            style={{
              fontSize: 'var(--text-mono-xs)',
              letterSpacing: '0.08em',
              color: 'var(--color-accent)',
              fontWeight: 600,
              marginBottom: 'var(--space-3)',
            }}
          >
            Access · required
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
              marginBottom: 'var(--space-4)',
            }}
          >
            Sign in to view your submissions.
          </h1>
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
            You need to be signed in to create and manage drafts.
          </p>
          <button
            type="button"
            onClick={handleSignIn}
            className="font-mono uppercase"
            style={{
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
            Sign in
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
      <SubmissionsList
        submissions={submissions}
        isLoading={isLoading}
        error={error}
        isAdmin={isAdmin}
        onNewSubmission={handleNewSubmission}
        onEditSubmission={handleEditSubmission}
        onViewSubmission={handleViewSubmission}
        onDeleteSubmission={handleDeleteSubmission}
      />
    </AppShell>
  )
}
