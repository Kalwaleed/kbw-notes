import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth, useSettings } from '../hooks'
import { useEffect, useState } from 'react'
import { Mail } from 'lucide-react'

type FormState = 'idle' | 'signing-in' | 'error'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { resolvedTheme, toggleTheme } = useSettings()
  const { user, instantSignIn, isEmailAllowed, isLoading } = useAuth()

  const [email, setEmail] = useState('')
  const [formState, setFormState] = useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Validate and normalize redirect path to prevent open redirect
  const rawFrom = (location.state as { from?: string })?.from
  const from = (() => {
    if (!rawFrom) return '/kbw-notes/home'
    try {
      const normalized = new URL(rawFrom, window.location.origin).pathname
      return normalized.startsWith('/kbw-notes/') ? normalized : '/kbw-notes/home'
    } catch {
      return '/kbw-notes/home'
    }
  })()

  // Redirect if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      navigate(from, { replace: true })
    }
  }, [user, isLoading, navigate, from])

  const normalizedEmail = email.toLowerCase().trim()
  const isValidDomain = normalizedEmail.length > 0 && isEmailAllowed(normalizedEmail)
  const showDomainWarning = normalizedEmail.length > 0 && normalizedEmail.includes('@') && !isValidDomain

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isValidDomain) {
      setFormState('error')
      setErrorMessage('Only @kbw.vc emails are allowed')
      return
    }

    setFormState('signing-in')
    setErrorMessage(null)

    const result = await instantSignIn(normalizedEmail)

    if (result.success) {
      // onAuthStateChange will fire and the useEffect above will redirect
      return
    }

    if (result.error === 'not_invited') {
      navigate('/rejected', { replace: true })
      return
    }

    setFormState('error')
    setErrorMessage(result.error ?? 'An error occurred')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-slate-500 dark:text-slate-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1
            className="text-3xl font-bold text-slate-900 dark:text-white"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Welcome to kbw Notes
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Are you invited? Enter your email to check.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {formState === 'error' && errorMessage && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (formState === 'error') {
                      setFormState('idle')
                      setErrorMessage(null)
                    }
                  }}
                  placeholder="you@kbw.vc"
                  disabled={formState === 'signing-in'}
                  className="block w-full pl-10 pr-3 py-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  autoComplete="email"
                  autoFocus
                />
              </div>
              {showDomainWarning && (
                <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                  Only @kbw.vc emails are allowed
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                formState === 'signing-in' ||
                !normalizedEmail ||
                showDomainWarning
              }
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {formState === 'signing-in' ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                'Continue'
              )}
            </button>
          </form>
        </div>

        {/* Theme Toggle */}
        <div className="text-center">
          <button
            onClick={toggleTheme}
            className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            {resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          </button>
        </div>

        {/* Terms */}
        <p className="text-center text-xs text-slate-400 dark:text-slate-500">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
