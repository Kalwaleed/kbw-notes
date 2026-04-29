import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import { isLocalAuthBypassEnabled, localDevSession, localDevUser } from '../lib/localDev'

const ALLOWED_DOMAIN = 'kbw.vc'

interface AuthResult {
  success: boolean
  error?: string
}

interface AuthContextValue {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAdmin: boolean
  error: Error | null
  requestMagicLink: (email: string) => Promise<AuthResult>
  isEmailAllowed: (email: string) => boolean
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

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // NFKC + invisible-character strip + strict @kbw.vc check.
  const isEmailAllowed = useCallback((email: string): boolean => {
    const normalizedEmail = email
      .normalize('NFKC')
      .toLowerCase()
      .trim()
      .replace(/\u00AD|\u034F|\u061C|\u115F|\u1160|\u17B4|\u17B5|[\u180B-\u180D\u200B-\u200F\u2060-\u206F\uFEFF]/g, '')

    const strictEmailRegex = /^[a-z0-9._%+-]+@kbw\.vc$/
    if (!strictEmailRegex.test(normalizedEmail)) return false

    const atCount = (normalizedEmail.match(/@/g) || []).length
    if (atCount !== 1) return false

    const [localPart, domain] = normalizedEmail.split('@')
    return localPart.length > 0 && domain === ALLOWED_DOMAIN
  }, [])

  // Magic-link only. Never returns a token to the client. The edge function
  // performs the rate-limit, invite check, and email send. We always treat a
  // 200 response as success on the UI side ("check your inbox") — the server
  // intentionally returns 200 even for non-invited or rate-limited emails to
  // avoid enumeration. Non-2xx responses indicate a transport or origin error.
  const requestMagicLink = useCallback(async (email: string): Promise<AuthResult> => {
    setError(null)
    const normalizedEmail = email.toLowerCase().trim()

    if (isLocalAuthBypassEnabled) {
      return { success: true }
    }

    if (!isEmailAllowed(normalizedEmail)) {
      return { success: false, error: 'Only @kbw.vc emails are allowed' }
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/request-magic-link`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: normalizedEmail,
            redirectTo: `${window.location.origin}/kbw-notes/home`,
          }),
        }
      )

      if (!response.ok) {
        return { success: false, error: 'Sign-in service unavailable' }
      }

      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network error'
      setError(err instanceof Error ? err : new Error(message))
      return { success: false, error: message }
    }
  }, [isEmailAllowed])

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

  const isAdmin = ((user?.app_metadata as { role?: string } | undefined)?.role) === 'admin'

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAdmin,
        error,
        requestMagicLink,
        isEmailAllowed,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }
export type { AuthContextValue }
