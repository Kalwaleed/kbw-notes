import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

const ALLOWED_DOMAIN = 'kbw.vc'

interface AuthResult {
  success: boolean
  error?: string
}

interface UseAuthReturn {
  user: User | null
  session: Session | null
  isLoading: boolean
  error: Error | null
  signUp: (email: string, password: string) => Promise<AuthResult>
  signInWithPassword: (email: string, password: string) => Promise<AuthResult>
  resetPassword: (email: string) => Promise<AuthResult>
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
  // Security: Uses NFKC normalization and strict validation to prevent bypass attacks
  const isEmailAllowed = useCallback((email: string): boolean => {
    // NFKC normalization is more aggressive than NFC - handles compatibility characters
    // Also strip zero-width and invisible characters that could be used for spoofing
    const normalizedEmail = email
      .normalize('NFKC')
      .toLowerCase()
      .trim()
      .replace(/\u200B|\u200C|\u200D|\u200E|\u200F|\uFEFF|\u00AD|\u034F|\u061C|\u115F|\u1160|\u17B4|\u17B5|\u180B|\u180C|\u180D|[\u2060-\u206F]/g, '')

    // Strict regex: only alphanumeric, dots, hyphens, underscores, plus in local part
    // Domain must be exactly kbw.vc (escaped dot)
    const strictEmailRegex = /^[a-z0-9._%+-]+@kbw\.vc$/

    if (!strictEmailRegex.test(normalizedEmail)) {
      return false
    }

    // Additional check: must have exactly one @ symbol (prevents attacker@evil.com@kbw.vc)
    const atCount = (normalizedEmail.match(/@/g) || []).length
    if (atCount !== 1) {
      return false
    }

    const [localPart, domain] = normalizedEmail.split('@')

    // Validate local part exists and domain matches exactly
    return localPart.length > 0 && domain === ALLOWED_DOMAIN
  }, [])

  // Sign up with email and password
  const signUp = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    setError(null)
    const normalizedEmail = email.toLowerCase().trim()

    if (!isEmailAllowed(normalizedEmail)) {
      return { success: false, error: 'Only @kbw.vc emails are allowed' }
    }

    if (password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters' }
    }

    try {
      const { error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
      })

      if (error) throw error
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create account'
      setError(err instanceof Error ? err : new Error(errorMessage))
      return { success: false, error: errorMessage }
    }
  }, [isEmailAllowed])

  // Sign in with email and password
  const signInWithPassword = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    setError(null)
    const normalizedEmail = email.toLowerCase().trim()

    if (!isEmailAllowed(normalizedEmail)) {
      return { success: false, error: 'Only @kbw.vc emails are allowed' }
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      })

      if (error) throw error
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in'
      setError(err instanceof Error ? err : new Error(errorMessage))
      return { success: false, error: errorMessage }
    }
  }, [isEmailAllowed])

  // Request password reset email
  const resetPassword = useCallback(async (email: string): Promise<AuthResult> => {
    setError(null)
    const normalizedEmail = email.toLowerCase().trim()

    if (!isEmailAllowed(normalizedEmail)) {
      return { success: false, error: 'Only @kbw.vc emails are allowed' }
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send reset email'
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
    signUp,
    signInWithPassword,
    resetPassword,
    isEmailAllowed,
    signOut,
  }
}
