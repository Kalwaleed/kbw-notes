import { createContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import { isLocalAuthBypassEnabled, localDevSession, localDevUser } from '../lib/localDev'

interface AuthContextValue {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAdmin: boolean
  isReviewer: boolean
  error: Error | null
  signIn: (email: string, password: string) => Promise<Error | null>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(isLocalAuthBypassEnabled ? localDevUser : null)
  const [session, setSession] = useState<Session | null>(isLocalAuthBypassEnabled ? localDevSession : null)
  const [isLoading, setIsLoading] = useState(!isLocalAuthBypassEnabled)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (isLocalAuthBypassEnabled) {
      setSession(localDevSession)
      setUser(localDevUser)
      setIsLoading(false)
      return
    }

    let cancelled = false

    async function bootstrap() {
      // Read any existing session (e.g. a bootstrapped admin), but never create
      // one. Public reading needs no session, and cover uploads now go through
      // the submit-reader-submission Edge Function (service role) rather than a
      // client-side anonymous session.
      const {
        data: { session: existing },
      } = await supabase.auth.getSession()
      if (cancelled) return
      setSession(existing)
      setUser(existing?.user ?? null)
      setIsLoading(false)
    }

    bootstrap()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  // Email/password sign-in for the ~15 staff self-report accounts. Login-only
  // by design: no signup or reset flow in the client (accounts are provisioned
  // via the Supabase dashboard).
  const signIn = useCallback(async (email: string, password: string): Promise<Error | null> => {
    setError(null)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      setSession(data.session)
      setUser(data.user)
      return null
    } catch (err) {
      const signInErr = err instanceof Error ? err : new Error('Failed to sign in')
      setError(signInErr)
      return signInErr
    }
  }, [])

  const signOut = useCallback(async () => {
    setError(null)
    if (isLocalAuthBypassEnabled) {
      setSession(localDevSession)
      setUser(localDevUser)
      return
    }

    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to sign out'))
      throw err
    }
  }, [])

  const role = (user?.app_metadata as { role?: string } | undefined)?.role
  const isAdmin = role === 'admin'
  const isReviewer = role === 'reviewer'

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      isLoading,
      isAdmin,
      isReviewer,
      error,
      signIn,
      signOut,
    }),
    [user, session, isLoading, isAdmin, isReviewer, error, signIn, signOut]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthContext }
export type { AuthContextValue }
