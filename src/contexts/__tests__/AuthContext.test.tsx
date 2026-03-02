import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { AuthProvider, AuthContext, type AuthContextValue } from '../AuthContext'
import { useContext } from 'react'

const mockSupabase = vi.hoisted(() => ({
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signInWithOtp: vi.fn().mockResolvedValue({ data: {}, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    }),
  },
}))
vi.mock('../../lib/supabase', () => ({ supabase: mockSupabase }))

// Helper to consume auth context
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

  // ── isEmailAllowed ──────────────────────────────────────────────
  describe('isEmailAllowed', () => {
    it('allows valid @kbw.vc emails', async () => {
      let result: boolean | undefined
      render(
        <AuthProvider>
          <AuthConsumer action={(ctx) => { result = ctx.isEmailAllowed('user@kbw.vc') }} />
        </AuthProvider>
      )
      await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))
      screen.getByTestId('action').click()
      expect(result).toBe(true)
    })

    it('rejects non-kbw.vc domains', async () => {
      let result: boolean | undefined
      render(
        <AuthProvider>
          <AuthConsumer action={(ctx) => { result = ctx.isEmailAllowed('user@gmail.com') }} />
        </AuthProvider>
      )
      await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))
      screen.getByTestId('action').click()
      expect(result).toBe(false)
    })

    it('is case-insensitive', async () => {
      let result: boolean | undefined
      render(
        <AuthProvider>
          <AuthConsumer action={(ctx) => { result = ctx.isEmailAllowed('User@KBW.VC') }} />
        </AuthProvider>
      )
      await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))
      screen.getByTestId('action').click()
      expect(result).toBe(true)
    })

    it('handles NFKC normalization', async () => {
      let result: boolean | undefined
      render(
        <AuthProvider>
          <AuthConsumer action={(ctx) => { result = ctx.isEmailAllowed('user@kbw.vc\uFEFF') }} />
        </AuthProvider>
      )
      await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))
      screen.getByTestId('action').click()
      expect(result).toBe(true)
    })

    it('strips zero-width characters', async () => {
      let result: boolean | undefined
      render(
        <AuthProvider>
          <AuthConsumer action={(ctx) => { result = ctx.isEmailAllowed('user\u200B@kbw.vc') }} />
        </AuthProvider>
      )
      await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))
      screen.getByTestId('action').click()
      expect(result).toBe(true)
    })

    it('rejects emails with multiple @ signs', async () => {
      let result: boolean | undefined
      render(
        <AuthProvider>
          <AuthConsumer action={(ctx) => { result = ctx.isEmailAllowed('user@@kbw.vc') }} />
        </AuthProvider>
      )
      await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))
      screen.getByTestId('action').click()
      expect(result).toBe(false)
    })

    it('rejects empty local part', async () => {
      let result: boolean | undefined
      render(
        <AuthProvider>
          <AuthConsumer action={(ctx) => { result = ctx.isEmailAllowed('@kbw.vc') }} />
        </AuthProvider>
      )
      await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))
      screen.getByTestId('action').click()
      expect(result).toBe(false)
    })
  })

  // ── signInWithOtp ─────────────────────────────────────────────
  describe('signInWithOtp', () => {
    it('rejects non-kbw.vc email', async () => {
      let result: { success: boolean; error?: string } | undefined
      render(
        <AuthProvider>
          <AuthConsumer action={async (ctx) => { result = await ctx.signInWithOtp('user@gmail.com') }} />
        </AuthProvider>
      )
      await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))
      await act(async () => { screen.getByTestId('action').click() })
      expect(result?.success).toBe(false)
      expect(result?.error).toBe('Only @kbw.vc emails are allowed')
      expect(mockSupabase.auth.signInWithOtp).not.toHaveBeenCalled()
    })

    it('calls supabase.auth.signInWithOtp with correct args', async () => {
      mockSupabase.auth.signInWithOtp.mockResolvedValue({ data: {}, error: null })
      let result: { success: boolean; error?: string } | undefined
      render(
        <AuthProvider>
          <AuthConsumer action={async (ctx) => { result = await ctx.signInWithOtp('user@kbw.vc') }} />
        </AuthProvider>
      )
      await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))
      await act(async () => { screen.getByTestId('action').click() })
      expect(result?.success).toBe(true)
      expect(mockSupabase.auth.signInWithOtp).toHaveBeenCalledWith({
        email: 'user@kbw.vc',
        options: {
          emailRedirectTo: expect.stringContaining('/kbw-notes/home'),
        },
      })
    })

    it('returns error from supabase', async () => {
      mockSupabase.auth.signInWithOtp.mockResolvedValue({ data: null, error: new Error('Rate limit exceeded') })
      let result: { success: boolean; error?: string } | undefined
      render(
        <AuthProvider>
          <AuthConsumer action={async (ctx) => { result = await ctx.signInWithOtp('user@kbw.vc') }} />
        </AuthProvider>
      )
      await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))
      await act(async () => { screen.getByTestId('action').click() })
      expect(result?.success).toBe(false)
      expect(result?.error).toBe('Rate limit exceeded')
    })
  })

  // ── signOut ─────────────────────────────────────────────────────
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

  // ── session init ────────────────────────────────────────────────
  describe('session initialization', () => {
    it('calls getSession on mount', async () => {
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
