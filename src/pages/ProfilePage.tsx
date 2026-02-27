import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AppShell } from '../components/shell'
import { useAuth, useProfile, useSettings } from '../hooks'

export function ProfilePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { resolvedTheme, toggleTheme } = useSettings()
  const { user, signOut, isLoading: authLoading } = useAuth()
  const { profile, isLoading: profileLoading } = useProfile(user?.id)

  const navigationItems = [
    { label: 'Submissions', href: '/kbw-notes/submissions', isActive: false },
    { label: 'Notifications', href: '/kbw-notes/notifications', isActive: false },
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

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/', { replace: true, state: { from: location.pathname } })
    }
  }, [authLoading, user, navigate, location.pathname])

  if (!authLoading && !user) {
    return null
  }

  const isLoading = authLoading || profileLoading

  // Use profile data if available, fall back to OAuth metadata
  const displayName = profile?.display_name ?? user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? user?.email ?? 'User'
  const avatarUrl = profile?.avatar_url ?? user?.user_metadata?.avatar_url ?? null
  const bio = profile?.bio ?? null
  const website = profile?.website ?? null
  const email = user?.email ?? ''
  const provider = user?.app_metadata?.provider ?? 'unknown'

  // User display for AppShell
  const userDisplay = user
    ? {
        name: displayName,
        avatarUrl: avatarUrl,
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
              Your Profile
            </h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              Manage your profile information
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            {resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

        {isLoading ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center">
            <p className="text-slate-500 dark:text-slate-400">Loading...</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
            {/* Profile Header */}
            <div className="flex items-start gap-4 mb-6">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-20 h-20 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-violet-600 flex items-center justify-center text-white text-2xl font-medium">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {displayName}
                </h2>
                <p className="text-slate-600 dark:text-slate-400">{email}</p>
                <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                  Signed in with {provider.charAt(0).toUpperCase() + provider.slice(1)}
                </p>
              </div>
              <button
                onClick={() => navigate('/kbw-notes/profile/setup', { state: { from: '/kbw-notes/profile' } })}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors"
              >
                Edit Profile
              </button>
            </div>

            {/* Bio Section */}
            {bio && (
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mb-4">
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                  Bio
                </h3>
                <p className="text-slate-900 dark:text-white">{bio}</p>
              </div>
            )}

            {/* Website Section */}
            {website && /^https?:\/\//i.test(website) && (
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                  Website
                </h3>
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  {website}
                </a>
              </div>
            )}

            {/* Empty state if no bio/website */}
            {!bio && !website && (
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  No bio or website added yet. Click "Edit Profile" to add more information.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}
