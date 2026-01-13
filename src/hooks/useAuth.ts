import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { User, Session, Provider } from '@supabase/supabase-js'

interface UseAuthReturn {
  user: User | null
  session: Session | null
  isLoading: boolean
  error: Error | null
  signInWithOAuth: (provider: Provider) => Promise<void>
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

  // Sign in with OAuth provider
  const signInWithOAuth = useCallback(async (provider: Provider) => {
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      })

      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to sign in'))
      throw err
    }
  }, [])

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
    signInWithOAuth,
    signOut,
  }
}
