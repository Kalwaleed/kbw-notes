import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { AppShell } from '../components/shell'
import { useTheme, useAuth, useSubmissions } from '../hooks'

export function NewSubmissionPage() {
  const navigate = useNavigate()
  const location = useLocation()
  useTheme()
  const { user, signOut } = useAuth()
  const { create } = useSubmissions()

  const navigationItems = [
    { label: 'Home', href: '/', isActive: false },
    { label: 'Submissions', href: '/submissions', isActive: location.pathname.startsWith('/submissions') },
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

  // Create new submission and redirect to edit page
  useEffect(() => {
    if (!user) return

    const createAndRedirect = async () => {
      const submission = await create()
      if (submission) {
        navigate(`/submissions/${submission.id}`, { replace: true })
      } else {
        navigate('/submissions', { replace: true })
      }
    }

    createAndRedirect()
  }, [user, create, navigate])

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
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Sign in to create a submission
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            You need to be logged in to create blog submissions.
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
        <p className="text-slate-600 dark:text-slate-400">Creating new submission...</p>
      </div>
    </AppShell>
  )
}
