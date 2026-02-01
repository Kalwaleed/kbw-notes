import { useNavigate, useLocation } from 'react-router-dom'
import { AppShell } from '../components/shell'
import { SubmissionsList } from '../components/submissions'
import { useTheme, useAuth, useSubmissions } from '../hooks'

export function SubmissionsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  useTheme()
  const { user, signOut } = useAuth()
  const { submissions, isLoading, error, create, remove } = useSubmissions()

  const navigationItems = [
    { label: 'Home', href: '/kbw-notes/home', isActive: false },
    { label: 'Submissions', href: '/kbw-notes/submissions', isActive: location.pathname.startsWith('/kbw-notes/submissions') },
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

  const handleNewSubmission = async () => {
    const submission = await create()
    if (submission) {
      navigate(`/kbw-notes/submissions/${submission.id}`)
    }
  }

  const handleEditSubmission = (id: string) => {
    navigate(`/kbw-notes/submissions/${id}`)
  }

  const handleViewSubmission = (id: string) => {
    // TODO: Navigate to public post view when slug is available
    navigate(`/kbw-notes/submissions/${id}`)
  }

  const handleDeleteSubmission = async (id: string) => {
    await remove(id)
  }

  // User display info
  const userDisplay = user
    ? {
        name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email ?? 'User',
        avatarUrl: user.user_metadata?.avatar_url,
      }
    : undefined

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
            Sign in to view your submissions
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            You need to be logged in to create and manage blog submissions.
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
      <SubmissionsList
        submissions={submissions}
        isLoading={isLoading}
        error={error}
        onNewSubmission={handleNewSubmission}
        onEditSubmission={handleEditSubmission}
        onViewSubmission={handleViewSubmission}
        onDeleteSubmission={handleDeleteSubmission}
      />
    </AppShell>
  )
}
