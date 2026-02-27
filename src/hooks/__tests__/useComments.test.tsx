import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import type { Comment } from '../../types/blog'

// Mock all external modules before importing
const mockFetchCommentsForPost = vi.fn()
const mockFetchCommentById = vi.fn()
const mockDeleteCommentQuery = vi.fn()
const mockToggleCommentLike = vi.fn()
vi.mock('../../lib/queries/comments', () => ({
  fetchCommentsForPost: (...args: unknown[]) => mockFetchCommentsForPost(...args),
  fetchCommentById: (...args: unknown[]) => mockFetchCommentById(...args),
  deleteComment: (...args: unknown[]) => mockDeleteCommentQuery(...args),
  toggleCommentLike: (...args: unknown[]) => mockToggleCommentLike(...args),
}))

const mockSubmitCommentForModeration = vi.fn()
vi.mock('../../lib/moderationService', () => ({
  submitCommentForModeration: (...args: unknown[]) => mockSubmitCommentForModeration(...args),
  ModerationError: class ModerationError extends Error {
    category?: string
    constructor(message: string, category?: string) {
      super(message)
      this.name = 'ModerationError'
      this.category = category
    }
  },
}))

const mockGetUser = vi.fn()
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: { getUser: (...args: unknown[]) => mockGetUser(...args) },
  },
}))

import { useComments } from '../useComments'
import { ModerationError } from '../../lib/moderationService'

const sampleComment: Comment = {
  id: 'c-1',
  content: 'Great post!',
  commenter: { id: 'u-1', name: 'Alice', avatarUrl: null },
  createdAt: '2026-01-01T00:00:00Z',
  reactions: 5,
  isModerated: true,
  replies: [],
}

const sampleReply: Comment = {
  id: 'c-2',
  content: 'Thanks!',
  commenter: { id: 'u-2', name: 'Bob', avatarUrl: null },
  createdAt: '2026-01-01T01:00:00Z',
  reactions: 0,
  isModerated: true,
  replies: [],
}

describe('useComments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetchCommentsForPost.mockResolvedValue([sampleComment])
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u-1' } } })
  })

  it('fetches comments on mount', async () => {
    const { result } = renderHook(() => useComments('post-1'))

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(mockFetchCommentsForPost).toHaveBeenCalledWith('post-1')
    expect(result.current.comments).toHaveLength(1)
    expect(result.current.comments[0].id).toBe('c-1')
  })

  it('sets error on fetch failure', async () => {
    mockFetchCommentsForPost.mockRejectedValue(new Error('DB down'))

    const { result } = renderHook(() => useComments('post-1'))

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toBe('DB down')
  })

  it('addComment submits via moderation and appends to state', async () => {
    mockSubmitCommentForModeration.mockResolvedValue('c-new')
    const newComment: Comment = {
      ...sampleComment,
      id: 'c-new',
      content: 'New comment',
    }
    mockFetchCommentById.mockResolvedValue(newComment)

    const { result } = renderHook(() => useComments('post-1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.addComment('New comment')
    })

    expect(mockSubmitCommentForModeration).toHaveBeenCalledWith('post-1', 'New comment', null)
    expect(result.current.comments).toHaveLength(2)
    expect(result.current.comments[1].id).toBe('c-new')
  })

  it('addComment sets moderationError on rejection', async () => {
    mockSubmitCommentForModeration.mockRejectedValue(new ModerationError('Spam', 'spam'))

    const { result } = renderHook(() => useComments('post-1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      try {
        await result.current.addComment('Buy now!')
      } catch {
        // Expected — hook re-throws after setting state
      }
    })

    expect(result.current.moderationError?.message).toBe('Spam')
    expect(result.current.moderationError?.category).toBe('spam')
  })

  it('addReply nests reply under correct parent', async () => {
    mockSubmitCommentForModeration.mockResolvedValue('c-2')
    mockFetchCommentById.mockResolvedValue(sampleReply)

    const { result } = renderHook(() => useComments('post-1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.addReply('c-1', 'Thanks!')
    })

    expect(mockSubmitCommentForModeration).toHaveBeenCalledWith('post-1', 'Thanks!', 'c-1')
    const parent = result.current.comments[0]
    expect(parent.replies).toHaveLength(1)
    expect(parent.replies[0].id).toBe('c-2')
  })

  it('addReply sets moderationError on rejection', async () => {
    mockSubmitCommentForModeration.mockRejectedValue(new ModerationError('Toxic', 'toxicity'))

    const { result } = renderHook(() => useComments('post-1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      try {
        await result.current.addReply('c-1', 'bad reply')
      } catch {
        // Expected
      }
    })

    expect(result.current.moderationError?.message).toBe('Toxic')
  })

  it('deleteComment replaces content with deletion marker', async () => {
    mockDeleteCommentQuery.mockResolvedValue(undefined)

    const { result } = renderHook(() => useComments('post-1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.deleteComment('c-1')
    })

    expect(mockDeleteCommentQuery).toHaveBeenCalledWith('c-1')
    expect(result.current.comments[0].content).toBe('[This comment has been deleted]')
  })

  it('likeComment applies optimistic update', async () => {
    mockToggleCommentLike.mockResolvedValue(true) // now liked
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u-1' } } })

    const { result } = renderHook(() => useComments('post-1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.likeComment('c-1')
    })

    expect(mockToggleCommentLike).toHaveBeenCalledWith('c-1', 'u-1')
    expect(result.current.comments[0].reactions).toBe(6)
    expect(result.current.userLikedComments.has('c-1')).toBe(true)
  })

  it('likeComment reverts on server error', async () => {
    mockToggleCommentLike.mockRejectedValue(new Error('Server error'))

    const { result } = renderHook(() => useComments('post-1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      try {
        await result.current.likeComment('c-1')
      } catch {
        // Expected
      }
    })

    // Should revert to original count
    expect(result.current.comments[0].reactions).toBe(5)
    expect(result.current.userLikedComments.has('c-1')).toBe(false)
  })

  it('likeComment requires authentication', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const { result } = renderHook(() => useComments('post-1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      try {
        await result.current.likeComment('c-1')
      } catch (err) {
        expect((err as Error).message).toBe('You must be logged in to like comments')
      }
    })
  })

  it('clearModerationError clears the error', async () => {
    mockSubmitCommentForModeration.mockRejectedValue(new ModerationError('Bad', 'spam'))

    const { result } = renderHook(() => useComments('post-1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      try {
        await result.current.addComment('spam')
      } catch {
        // Expected
      }
    })

    expect(result.current.moderationError).not.toBeNull()

    act(() => {
      result.current.clearModerationError()
    })

    expect(result.current.moderationError).toBeNull()
  })

  it('refresh re-fetches comments', async () => {
    const { result } = renderHook(() => useComments('post-1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    mockFetchCommentsForPost.mockResolvedValue([sampleComment, { ...sampleReply, replies: [] }])

    await act(async () => {
      await result.current.refresh()
    })

    expect(mockFetchCommentsForPost).toHaveBeenCalledTimes(2)
    expect(result.current.comments).toHaveLength(2)
  })

  it('does not fetch when postId is empty', async () => {
    renderHook(() => useComments(''))

    // Give it a tick
    await act(async () => { await new Promise((r) => setTimeout(r, 0)) })
    expect(mockFetchCommentsForPost).not.toHaveBeenCalled()
  })
})
