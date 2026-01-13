import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { AppShell } from '../components/shell'
import { useTheme, useAuth } from '../hooks'

export function SubmissionDetailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  const { theme, toggleTheme } = useTheme()
  const { user, signOut } = useAuth()

  const navigationItems = [
    { label: 'Submissions', href: '/submissions', isActive: location.pathname.startsWith('/submissions') },
    { label: 'Notifications', href: '/notifications', isActive: false },
  ]

  const handleNavigate = (href: string) => {
    navigate(href)
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  const handleSignIn = () => {
    navigate('/login', { state: { from: location.pathname } })
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
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Submission Detail
            </h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              Viewing submission ID: {id}
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center">
          <p className="text-slate-500 dark:text-slate-400">
            Submission detail view will be implemented in the User Submissions milestone.
          </p>
          <p className="mt-2 text-sm text-slate-400 dark:text-slate-500">
            Route: <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">/submissions/:id</code>
          </p>

          <button
            onClick={() => navigate('/submissions')}
            className="mt-6 px-4 py-2 text-sm font-medium rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Back to Submissions
          </button>
        </div>
      </div>
    </AppShell>
  )
}
