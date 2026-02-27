import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSupabase = vi.hoisted(() => ({
  functions: {
    invoke: vi.fn().mockResolvedValue({ data: null, error: null }),
  },
}))
vi.mock('../supabase', () => ({ supabase: mockSupabase }))

import { submitCommentForModeration, ModerationError } from '../moderationService'

describe('submitCommentForModeration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns commentId when approved', async () => {
    mockSupabase.functions.invoke.mockResolvedValue({
      data: { approved: true, commentId: 'comment-123' },
      error: null,
    })

    const id = await submitCommentForModeration('post-1', 'Great post!')
    expect(id).toBe('comment-123')
    expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('moderate-comment', {
      body: { postId: 'post-1', content: 'Great post!', parentId: null },
    })
  })

  it('passes parentId when provided', async () => {
    mockSupabase.functions.invoke.mockResolvedValue({
      data: { approved: true, commentId: 'reply-456' },
      error: null,
    })

    await submitCommentForModeration('post-1', 'Nice reply', 'parent-1')
    expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('moderate-comment', {
      body: { postId: 'post-1', content: 'Nice reply', parentId: 'parent-1' },
    })
  })

  it('converts null-ish parentId to null', async () => {
    mockSupabase.functions.invoke.mockResolvedValue({
      data: { approved: true, commentId: 'c-1' },
      error: null,
    })

    await submitCommentForModeration('post-1', 'text', undefined)
    expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('moderate-comment', {
      body: { postId: 'post-1', content: 'text', parentId: null },
    })
  })

  it('throws ModerationError when rejected', async () => {
    mockSupabase.functions.invoke.mockResolvedValue({
      data: { approved: false, rejectionReason: 'Spam detected', category: 'spam' },
      error: null,
    })

    await expect(submitCommentForModeration('post-1', 'Buy now!')).rejects.toThrow(ModerationError)
    try {
      await submitCommentForModeration('post-1', 'Buy now!')
    } catch (err) {
      expect(err).toBeInstanceOf(ModerationError)
      expect((err as ModerationError).message).toBe('Spam detected')
      expect((err as ModerationError).category).toBe('spam')
    }
  })

  it('throws ModerationError with default message when no reason given', async () => {
    mockSupabase.functions.invoke.mockResolvedValue({
      data: { approved: false },
      error: null,
    })

    await expect(submitCommentForModeration('post-1', 'bad')).rejects.toThrow(
      'Your comment was rejected for violating community guidelines.'
    )
  })

  it('throws generic Error when invoke returns error', async () => {
    mockSupabase.functions.invoke.mockResolvedValue({
      data: null,
      error: { message: 'Function crashed' },
    })

    await expect(submitCommentForModeration('post-1', 'hi')).rejects.toThrow('Function crashed')
  })

  it('throws rate limit error on 429', async () => {
    mockSupabase.functions.invoke.mockResolvedValue({
      data: null,
      error: { message: '429 Too Many Requests' },
    })

    await expect(submitCommentForModeration('post-1', 'hi')).rejects.toThrow(
      'Too many comments. Please wait a moment before trying again.'
    )
  })

  it('throws rate limit error when message contains "rate"', async () => {
    mockSupabase.functions.invoke.mockResolvedValue({
      data: null,
      error: { message: 'rate limit exceeded' },
    })

    await expect(submitCommentForModeration('post-1', 'hi')).rejects.toThrow(
      'Too many comments. Please wait a moment before trying again.'
    )
  })

  it('throws when approved but no commentId returned', async () => {
    mockSupabase.functions.invoke.mockResolvedValue({
      data: { approved: true },
      error: null,
    })

    await expect(submitCommentForModeration('post-1', 'hi')).rejects.toThrow(
      'Comment approved but no ID returned'
    )
  })

  it('reads error body from context.json when available', async () => {
    mockSupabase.functions.invoke.mockResolvedValue({
      data: null,
      error: {
        message: 'FunctionsHttpError',
        context: {
          json: vi.fn().mockResolvedValue({ error: 'Post not found' }),
        },
      },
    })

    await expect(submitCommentForModeration('post-1', 'hi')).rejects.toThrow('Post not found')
  })
})
