import { useNavigate, useLocation } from 'react-router-dom'
import { AppShell } from '../components/shell'
import { NotificationsList } from '../components/notifications'
import { useTheme, useAuth, useNotifications } from '../hooks'

export function NotificationsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
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
    { label: 'Home', href: '/kbw-notes/home', isActive: false },
    { label: 'Notifications', href: '/kbw-notes/notifications', isActive: location.pathname === '/kbw-notes/notifications' },
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

  // User display info
  const userDisplay = user
    ? {
        name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email ?? 'User',
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-3xl font-bold text-slate-900 dark:text-white"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Notifications
            </h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              Your activity and updates
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

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
