import { describe, it, expect, vi, beforeEach } from 'vitest'

const rpc = vi.fn()
vi.mock('../../supabase', () => ({
  supabase: { rpc: (...args: unknown[]) => rpc(...args) },
}))

import { toggleEngagement } from '../engagement'

describe('toggleEngagement', () => {
  beforeEach(() => {
    rpc.mockReset()
  })

  it('dispatches comment_like to toggle_comment_like RPC', async () => {
    rpc.mockResolvedValue({ data: true, error: null })
    const result = await toggleEngagement('comment_like', 'c-1')
    expect(rpc).toHaveBeenCalledWith('toggle_comment_like', { p_comment_id: 'c-1' })
    expect(result).toBe(true)
  })

  it('returns false when the RPC reports the engagement was removed', async () => {
    rpc.mockResolvedValue({ data: false, error: null })
    const result = await toggleEngagement('comment_like', 'c-2')
    expect(result).toBe(false)
  })

  it('throws on RPC error with kind in the message', async () => {
    rpc.mockResolvedValue({ data: null, error: { message: 'auth required' } })
    await expect(toggleEngagement('comment_like', 'c-3')).rejects.toThrow(
      /comment_like.*auth required/i
    )
  })

  it('does not pass userId — auth.uid() resolves it server-side', async () => {
    rpc.mockResolvedValue({ data: true, error: null })
    await toggleEngagement('comment_like', 'c-4')
    const [, payload] = rpc.mock.calls[0]
    expect(payload).toEqual({ p_comment_id: 'c-4' })
    expect(payload).not.toHaveProperty('user_id')
  })
})
