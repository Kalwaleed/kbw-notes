import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme, useAuth } from '../hooks'
import { useEffect, useState } from 'react'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'

type AuthMode = 'signin' | 'signup' | 'forgot'
type FormState = 'idle' | 'submitting' | 'success' | 'error'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const { user, signUp, signInWithPassword, resetPassword, isEmailAllowed, isLoading } = useAuth()

  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formState, setFormState] = useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Get the redirect path from state, or default to home
  const from = (location.state as { from?: string })?.from ?? '/kbw-notes/home'

  // Redirect if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      navigate(from, { replace: true })
    }
  }, [user, isLoading, navigate, from])

  const normalizedEmail = email.toLowerCase().trim()
  const isValidDomain = normalizedEmail.length > 0 && isEmailAllowed(normalizedEmail)
  const showDomainWarning = normalizedEmail.length > 0 && normalizedEmail.includes('@') && !isValidDomain
  const passwordsMatch = password === confirmPassword
  const isPasswordValid = password.length >= 8

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isValidDomain) {
      setFormState('error')
      setErrorMessage('Only @kbw.vc emails are allowed')
      return
    }

    if (mode === 'signup') {
      if (!isPasswordValid) {
        setFormState('error')
        setErrorMessage('Password must be at least 8 characters')
        return
      }
      if (!passwordsMatch) {
        setFormState('error')
        setErrorMessage('Passwords do not match')
        return
      }
    }

    setFormState('submitting')
    setErrorMessage(null)

    let result
    if (mode === 'signin') {
      result = await signInWithPassword(normalizedEmail, password)
    } else if (mode === 'signup') {
      result = await signUp(normalizedEmail, password)
    } else {
      result = await resetPassword(normalizedEmail)
    }

    if (result.success) {
      if (mode === 'forgot' || mode === 'signup') {
        // Both forgot password and signup require email action
        setFormState('success')
      }
      // For signin, the auth state change will trigger redirect
    } else {
      setFormState('error')
      setErrorMessage(result.error ?? 'An error occurred')
    }
  }

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode)
    setFormState('idle')
    setErrorMessage(null)
    setPassword('')
    setConfirmPassword('')
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setFormState('idle')
    setErrorMessage(null)
    setMode('signin')
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
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Welcome to kbw Notes
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {mode === 'forgot'
              ? 'Reset your password'
              : mode === 'signup'
                ? 'Create your account'
                : 'Sign in to your account'}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8">
          {/* Email Confirmation Success (for signup and forgot password) */}
          {(mode === 'forgot' || mode === 'signup') && formState === 'success' ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Check your email
                </h2>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                  {mode === 'signup'
                    ? <>We sent a confirmation link to <strong>{normalizedEmail}</strong>. Please verify your email to complete registration.</>
                    : <>We sent a password reset link to <strong>{normalizedEmail}</strong></>
                  }
                </p>
              </div>
              <button
                onClick={resetForm}
                className="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <>
              {/* Tab Toggle (only for signin/signup) */}
              {mode !== 'forgot' && (
                <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1 mb-6">
                  <button
                    onClick={() => handleModeChange('signin')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                      mode === 'signin'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleModeChange('signup')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                      mode === 'signup'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {/* Form */}
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
                      disabled={formState === 'submitting'}
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

                {/* Password Input (not shown for forgot mode) */}
                {mode !== 'forgot' && (
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          if (formState === 'error') {
                            setFormState('idle')
                            setErrorMessage(null)
                          }
                        }}
                        placeholder="Enter your password"
                        disabled={formState === 'submitting'}
                        className="block w-full pl-10 pr-10 py-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {mode === 'signup' && password.length > 0 && !isPasswordValid && (
                      <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                        Password must be at least 8 characters
                      </p>
                    )}
                  </div>
                )}

                {/* Confirm Password (only for signup) */}
                {mode === 'signup' && (
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value)
                          if (formState === 'error') {
                            setFormState('idle')
                            setErrorMessage(null)
                          }
                        }}
                        placeholder="Confirm your password"
                        disabled={formState === 'submitting'}
                        className="block w-full pl-10 pr-3 py-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                        autoComplete="new-password"
                      />
                    </div>
                    {confirmPassword.length > 0 && !passwordsMatch && (
                      <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                        Passwords do not match
                      </p>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={
                    formState === 'submitting' ||
                    !normalizedEmail ||
                    showDomainWarning ||
                    (mode !== 'forgot' && !password) ||
                    (mode === 'signup' && (!isPasswordValid || !passwordsMatch))
                  }
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formState === 'submitting' ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {mode === 'forgot' ? 'Sending...' : mode === 'signup' ? 'Creating account...' : 'Signing in...'}
                    </>
                  ) : (
                    mode === 'forgot' ? 'Send Reset Link' : mode === 'signup' ? 'Create Account' : 'Sign In'
                  )}
                </button>

                {/* Forgot Password Link (only for signin) */}
                {mode === 'signin' && (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => handleModeChange('forgot')}
                      className="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Back to Sign In (for forgot mode) */}
                {mode === 'forgot' && (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => handleModeChange('signin')}
                      className="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
                    >
                      Back to sign in
                    </button>
                  </div>
                )}
              </form>
            </>
          )}
        </div>

        {/* Theme Toggle */}
        <div className="text-center">
          <button
            onClick={toggleTheme}
            className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
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
