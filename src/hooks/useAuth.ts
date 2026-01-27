import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

const ALLOWED_DOMAIN = 'kbw.vc'

interface SignInResult {
  success: boolean
  error?: string
}

interface UseAuthReturn {
  user: User | null
  session: Session | null
  isLoading: boolean
  error: Error | null
  signInWithEmail: (email: string) => Promise<SignInResult>
  isEmailAllowed: (email: string) => boolean
  signOut: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Check if email domain is allowed
  const isEmailAllowed = useCallback((email: string): boolean => {
    const normalizedEmail = email.toLowerCase().trim()
    return normalizedEmail.endsWith(`@${ALLOWED_DOMAIN}`)
  }, [])

  // Sign in with email magic link
  const signInWithEmail = useCallback(async (email: string): Promise<SignInResult> => {
    setError(null)
    const normalizedEmail = email.toLowerCase().trim()

    if (!isEmailAllowed(normalizedEmail)) {
      return { success: false, error: 'access not allowed, Bro' }
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/home`,
        },
      })

      if (error) throw error
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send magic link'
      setError(err instanceof Error ? err : new Error(errorMessage))
      return { success: false, error: errorMessage }
    }
  }, [isEmailAllowed])

  // Sign out
  const signOut = useCallback(async () => {
    setError(null)

    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to sign out'))
      throw err
    }
  }, [])

  return {
    user,
    session,
    isLoading,
    error,
    signInWithEmail,
    isEmailAllowed,
    signOut,
  }
}
