import { useNavigate, useLocation } from 'react-router-dom'
import { AppShell } from '../components/shell'
import { NotificationsList } from '../components/notifications'
import { useAuth, useNotifications } from '../hooks'

export function NotificationsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signOut } = useAuth()
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications()

  const navigationItems = [
    { label: 'Home',          href: '/kbw-notes/home',          isActive: false },
    { label: 'Submissions',   href: '/kbw-notes/submissions',   isActive: false },
    { label: 'Notifications', href: '/kbw-notes/notifications', isActive: location.pathname === '/kbw-notes/notifications' },
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

  return (
    <AppShell
      navigationItems={navigationItems}
      user={userDisplay}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      onSignIn={handleSignIn}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-7)' }}>
        <header>
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
            Inbox
          </div>
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
            Notifications.
          </h1>
        </header>

        <NotificationsList
          notifications={notifications}
          unreadCount={unreadCount}
          isLoading={isLoading}
          error={error}
          isAuthenticated={!!user}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onDelete={deleteNotification}
          onNavigate={handleNavigate}
          onSignIn={handleSignIn}
        />
      </div>
    </AppShell>
  )
}
