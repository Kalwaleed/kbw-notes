import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { AuthProvider, AuthContext, type AuthContextValue } from '../AuthContext'
import { useContext } from 'react'

const mockSupabase = vi.hoisted(() => ({
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signUp: vi.fn().mockResolvedValue({ data: {}, error: null }),
    signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
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

  // ── signUp ──────────────────────────────────────────────────────
  describe('signUp', () => {
    it('rejects non-kbw.vc email', async () => {
      let result: { success: boolean; error?: string } | undefined
      render(
        <AuthProvider>
          <AuthConsumer action={async (ctx) => { result = await ctx.signUp('user@gmail.com', 'password123') }} />
        </AuthProvider>
      )
      await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))
      await act(async () => { screen.getByTestId('action').click() })
      expect(result?.success).toBe(false)
      expect(result?.error).toBe('Only @kbw.vc emails are allowed')
      expect(mockSupabase.auth.signUp).not.toHaveBeenCalled()
    })

    it('rejects short password', async () => {
      let result: { success: boolean; error?: string } | undefined
      render(
        <AuthProvider>
          <AuthConsumer action={async (ctx) => { result = await ctx.signUp('user@kbw.vc', 'short') }} />
        </AuthProvider>
      )
      await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))
      await act(async () => { screen.getByTestId('action').click() })
      expect(result?.success).toBe(false)
      expect(result?.error).toBe('Password must be at least 8 characters')
    })

    it('calls supabase.auth.signUp on valid input', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({ data: {}, error: null })
      let result: { success: boolean; error?: string } | undefined
      render(
        <AuthProvider>
          <AuthConsumer action={async (ctx) => { result = await ctx.signUp('user@kbw.vc', 'password123') }} />
        </AuthProvider>
      )
      await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))
      await act(async () => { screen.getByTestId('action').click() })
      expect(result?.success).toBe(true)
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'user@kbw.vc',
        password: 'password123',
      })
    })

    it('returns error from supabase', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({ data: null, error: new Error('Email taken') })
      let result: { success: boolean; error?: string } | undefined
      render(
        <AuthProvider>
          <AuthConsumer action={async (ctx) => { result = await ctx.signUp('user@kbw.vc', 'password123') }} />
        </AuthProvider>
      )
      await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))
      await act(async () => { screen.getByTestId('action').click() })
      expect(result?.success).toBe(false)
      expect(result?.error).toBe('Email taken')
    })
  })

  // ── signInWithPassword ──────────────────────────────────────────
  describe('signInWithPassword', () => {
    it('rejects non-kbw.vc email', async () => {
      let result: { success: boolean; error?: string } | undefined
      render(
        <AuthProvider>
          <AuthConsumer action={async (ctx) => { result = await ctx.signInWithPassword('user@other.com', 'pass1234') }} />
        </AuthProvider>
      )
      await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))
      await act(async () => { screen.getByTestId('action').click() })
      expect(result?.success).toBe(false)
      expect(result?.error).toBe('Only @kbw.vc emails are allowed')
    })

    it('calls supabase on valid input', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({ data: {}, error: null })
      let result: { success: boolean; error?: string } | undefined
      render(
        <AuthProvider>
          <AuthConsumer action={async (ctx) => { result = await ctx.signInWithPassword('user@kbw.vc', 'pass1234') }} />
        </AuthProvider>
      )
      await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))
      await act(async () => { screen.getByTestId('action').click() })
      expect(result?.success).toBe(true)
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'user@kbw.vc',
        password: 'pass1234',
      })
    })
  })

  // ── resetPassword ───────────────────────────────────────────────
  describe('resetPassword', () => {
    it('rejects non-kbw.vc email', async () => {
      let result: { success: boolean; error?: string } | undefined
      render(
        <AuthProvider>
          <AuthConsumer action={async (ctx) => { result = await ctx.resetPassword('user@other.com') }} />
        </AuthProvider>
      )
      await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))
      await act(async () => { screen.getByTestId('action').click() })
      expect(result?.success).toBe(false)
      expect(result?.error).toBe('Only @kbw.vc emails are allowed')
    })

    it('sends reset email for valid kbw.vc address', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null })
      let result: { success: boolean; error?: string } | undefined
      render(
        <AuthProvider>
          <AuthConsumer action={async (ctx) => { result = await ctx.resetPassword('user@kbw.vc') }} />
        </AuthProvider>
      )
      await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))
      await act(async () => { screen.getByTestId('action').click() })
      expect(result?.success).toBe(true)
      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'user@kbw.vc',
        expect.objectContaining({ redirectTo: expect.stringContaining('/reset-password') })
      )
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
