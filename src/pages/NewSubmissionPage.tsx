import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AppShell } from '../components/shell'
import { useAuth, useSubmissions } from '../hooks'

export function NewSubmissionPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signOut } = useAuth()
  const { create } = useSubmissions()

  const navigationItems = [
    { label: 'Home',          href: '/kbw-notes/home',          isActive: false },
    { label: 'Submissions',   href: '/kbw-notes/submissions',   isActive: location.pathname.startsWith('/kbw-notes/submissions') },
    { label: 'Notifications', href: '/kbw-notes/notifications', isActive: false },
    { label: 'Settings',      href: '/kbw-notes/settings',      isActive: false },
  ]

  const handleNavigate = (href: string) => navigate(href)
  const handleLogout = async () => { await signOut(); navigate('/') }
  const handleSignIn = () => navigate('/', { state: { from: location.pathname } })

  const userDisplay = user
    ? {
        name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email ?? 'User',
        email: user.email ?? undefined,
        avatarUrl: user.user_metadata?.avatar_url,
      }
    : undefined

  useEffect(() => {
    if (!user) return
    const createAndRedirect = async () => {
      const submission = await create()
      if (submission) {
        navigate(`/kbw-notes/submissions/${submission.id}`, { replace: true })
      } else {
        navigate('/kbw-notes/submissions', { replace: true })
      }
    }
    createAndRedirect()
  }, [user, create, navigate])

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
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 700,
              fontSize: 'var(--text-h2)',
              color: 'var(--color-ink)',
              margin: 0,
              marginBottom: 'var(--space-4)',
            }}
          >
            Sign in to create a submission.
          </h1>
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
      <div
        className="font-mono uppercase"
        style={{
          padding: 'var(--space-9) 0',
          textAlign: 'center',
          fontSize: 'var(--text-mono-xs)',
          letterSpacing: '0.08em',
          color: 'var(--color-ink-soft)',
        }}
      >
        Creating new submission…
      </div>
    </AppShell>
  )
}
