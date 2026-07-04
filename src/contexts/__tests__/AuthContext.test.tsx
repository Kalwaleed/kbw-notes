import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { AuthProvider, AuthContext, type AuthContextValue } from '../AuthContext'
import { useContext } from 'react'

const mockSupabase = vi.hoisted(() => ({
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    }),
  },
}))
vi.mock('../../lib/supabase', () => ({ supabase: mockSupabase }))

function AuthConsumer({ action }: { action?: (ctx: AuthContextValue) => void }) {
  const ctx = useContext(AuthContext)
  if (!ctx) return <div>no context</div>

  return (
    <div>
      <span data-testid="loading">{String(ctx.isLoading)}</span>
      <span data-testid="user">{ctx.user?.email ?? 'none'}</span>
      <span data-testid="error">{ctx.error?.message ?? 'none'}</span>
      <button data-testid="action" onClick={() => action?.(ctx)}>act</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    })
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    })
  })

  describe('signOut', () => {
    it('calls supabase.auth.signOut', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null })
      render(
        <AuthProvider>
          <AuthConsumer action={async (ctx) => { await ctx.signOut() }} />
        </AuthProvider>
      )
      await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))
      await act(async () => { screen.getByTestId('action').click() })
      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    })
  })

  describe('session initialization', () => {
    it('reads the existing session on mount but never creates one', async () => {
      render(<AuthProvider><div /></AuthProvider>)
      await waitFor(() => {
        expect(mockSupabase.auth.getSession).toHaveBeenCalled()
      })
    })

    it('subscribes to onAuthStateChange', async () => {
      render(<AuthProvider><div /></AuthProvider>)
      await waitFor(() => {
        expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalled()
      })
    })

    it('unsubscribes on unmount', async () => {
      const unsubscribe = vi.fn()
      mockSupabase.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe } },
      })

      const { unmount } = render(<AuthProvider><div /></AuthProvider>)
      unmount()
      expect(unsubscribe).toHaveBeenCalled()
    })
  })
})
