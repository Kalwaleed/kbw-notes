// signIn/isReviewer additions to AuthContext (staff self-report feature).
// Separate file from AuthContext.test.tsx on purpose — that file contains
// invisible-unicode fixtures that make editing it hazardous.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useContext, type ReactNode } from 'react'
import { AuthProvider, AuthContext } from '../AuthContext'

const mockAuth = vi.hoisted(() => ({
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock('../../lib/supabase', () => ({
  supabase: { auth: mockAuth },
}))

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

function useAuthCtx() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('no provider')
  return ctx
}

const reviewerUser = {
  id: 'donya-1',
  email: 'donya@example.com',
  app_metadata: { role: 'reviewer' },
}

describe('AuthContext signIn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.getSession.mockResolvedValue({ data: { session: null } })
    mockAuth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    })
  })

  it('signs in with email/password and updates user state', async () => {
    mockAuth.signInWithPassword.mockResolvedValue({
      data: { user: reviewerUser, session: { user: reviewerUser } },
      error: null,
    })

    const { result } = renderHook(() => useAuthCtx(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      const err = await result.current.signIn('donya@example.com', 'pw')
      expect(err).toBeNull()
    })

    expect(mockAuth.signInWithPassword).toHaveBeenCalledWith({
      email: 'donya@example.com',
      password: 'pw',
    })
    expect(result.current.user?.id).toBe('donya-1')
    expect(result.current.isReviewer).toBe(true)
    expect(result.current.isAdmin).toBe(false)
  })

  it('returns the error on bad credentials without setting a user', async () => {
    mockAuth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: new Error('Invalid login credentials'),
    })

    const { result } = renderHook(() => useAuthCtx(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      const err = await result.current.signIn('x@example.com', 'wrong')
      expect(err?.message).toBe('Invalid login credentials')
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isReviewer).toBe(false)
  })

  it('reports isReviewer false for a plain staff user', async () => {
    const staffUser = { id: 's-1', email: 's@example.com', app_metadata: {} }
    mockAuth.signInWithPassword.mockResolvedValue({
      data: { user: staffUser, session: { user: staffUser } },
      error: null,
    })

    const { result } = renderHook(() => useAuthCtx(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.signIn('s@example.com', 'pw')
    })

    expect(result.current.isReviewer).toBe(false)
  })
})
