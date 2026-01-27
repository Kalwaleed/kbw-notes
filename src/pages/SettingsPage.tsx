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
    setFontSize,
    setDensity,
    reading,
    setDefaultSort,
    setPostsPerPage,
    setAutoExpandComments,
  } = useSettings()

  const navigationItems = [
    { label: 'Home', href: '/home', isActive: false },
    { label: 'Settings', href: '/settings', isActive: location.pathname === '/settings' },
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
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <div className="mb-8">
          <h1
            className="text-3xl font-bold text-slate-900 dark:text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Settings
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Customize your experience
          </p>
        </div>

        <AppearanceSettings
          theme={appearance.theme}
          fontSize={appearance.fontSize}
          density={appearance.density}
          onThemeChange={setTheme}
          onFontSizeChange={setFontSize}
          onDensityChange={setDensity}
        />

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
