import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { AppShell } from '../components/shell'
import { useAuth, useSettings } from '../hooks'
import {
  AppearanceSettings,
  ReadingSettings,
  NotificationSettings,
  PrivacySettings,
  AccountSettings,
} from '../components/settings'

export function SettingsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signOut } = useAuth()
  const {
    appearance,
    setTheme,
    reading,
    setDefaultSort,
    setPostsPerPage,
    setAutoExpandComments,
  } = useSettings()

  const navigationItems = [
    { label: 'Home',          href: '/kbw-notes/home',          isActive: false },
    { label: 'Submissions',   href: '/kbw-notes/submissions',   isActive: false },
    { label: 'Notifications', href: '/kbw-notes/notifications', isActive: false },
    { label: 'Settings',      href: '/kbw-notes/settings',      isActive: location.pathname === '/kbw-notes/settings' },
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <button
          type="button"
          onClick={() => navigate('/kbw-notes/home')}
          className="font-mono uppercase inline-flex items-center"
          style={{
            gap: 6,
            fontSize: 'var(--text-mono-sm)',
            fontWeight: 500,
            letterSpacing: '0.04em',
            color: 'var(--color-ink-muted)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            alignSelf: 'flex-start',
            padding: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-ink)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-ink-muted)' }}
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Back to home
        </button>

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
            Preferences
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
            Settings.
          </h1>
        </header>

        <AppearanceSettings theme={appearance.theme} onThemeChange={setTheme} />

        <ReadingSettings
          defaultSort={reading.defaultSort}
          postsPerPage={reading.postsPerPage}
          autoExpandComments={reading.autoExpandComments}
          onDefaultSortChange={setDefaultSort}
          onPostsPerPageChange={setPostsPerPage}
          onAutoExpandCommentsChange={setAutoExpandComments}
        />

        <NotificationSettings />

        <PrivacySettings />

        <AccountSettings />
      </div>
    </AppShell>
  )
}
