import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
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
          <AuthConsumer action={(ctx) => { result = ctx.isEmailAllowed('user@kbw.vc﻿') }} />
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
          <AuthConsumer action={(ctx) => { result = ctx.isEmailAllowed('user​@kbw.vc') }} />
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

  describe('requestMagicLink', () => {
    let fetchMock: ReturnType<typeof vi.fn>

    beforeEach(() => {
      fetchMock = vi.fn()
      vi.stubGlobal('fetch', fetchMock)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('rejects non-kbw.vc email without calling the edge function', async () => {
      let result: { success: boolean; error?: string } | undefined
      render(
        <AuthProvider>
          <AuthConsumer action={async (ctx) => { result = await ctx.requestMagicLink('user@gmail.com') }} />
        </AuthProvider>
      )
      await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))
      await act(async () => { screen.getByTestId('action').click() })
      expect(result?.success).toBe(false)
      expect(result?.error).toBe('Only @kbw.vc emails are allowed')
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('posts email + redirectTo to /functions/v1/request-magic-link and returns success on 200', async () => {
      fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => ({ ok: true }) })
      let result: { success: boolean; error?: string } | undefined
      render(
        <AuthProvider>
          <AuthConsumer action={async (ctx) => { result = await ctx.requestMagicLink('user@kbw.vc') }} />
        </AuthProvider>
      )
      await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))
      await act(async () => { screen.getByTestId('action').click() })
      expect(result?.success).toBe(true)
      expect(fetchMock).toHaveBeenCalledTimes(1)
      const [url, init] = fetchMock.mock.calls[0]
      expect(url).toContain('/functions/v1/request-magic-link')
      expect(init?.method).toBe('POST')
      expect(JSON.parse(init?.body as string)).toMatchObject({
        email: 'user@kbw.vc',
        redirectTo: expect.stringContaining('/kbw-notes/home'),
      })
    })

    it('returns failure when the edge function responds non-2xx', async () => {
      fetchMock.mockResolvedValue({ ok: false, status: 500, json: async () => ({ error: 'oops' }) })
      let result: { success: boolean; error?: string } | undefined
      render(
        <AuthProvider>
          <AuthConsumer action={async (ctx) => { result = await ctx.requestMagicLink('user@kbw.vc') }} />
        </AuthProvider>
      )
      await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))
      await act(async () => { screen.getByTestId('action').click() })
      expect(result?.success).toBe(false)
      expect(result?.error).toBe('Sign-in service unavailable')
    })

    it('treats network failures as errors', async () => {
      fetchMock.mockRejectedValue(new Error('network down'))
      let result: { success: boolean; error?: string } | undefined
      render(
        <AuthProvider>
          <AuthConsumer action={async (ctx) => { result = await ctx.requestMagicLink('user@kbw.vc') }} />
        </AuthProvider>
      )
      await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'))
      await act(async () => { screen.getByTestId('action').click() })
      expect(result?.success).toBe(false)
      expect(result?.error).toBe('network down')
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
