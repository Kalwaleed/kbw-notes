import { useState, useEffect, useCallback } from 'react'
import type { Comment } from '../components/blog-post/types'
import {
  fetchCommentsForPost,
  fetchCommentById,
  deleteComment as deleteCommentQuery,
} from '../lib/queries/comments'
import { submitCommentForModeration, ModerationError } from '../lib/moderationService'

interface ModerationErrorState {
  message: string
  category?: string
}

interface UseCommentsResult {
  comments: Comment[]
  isLoading: boolean
  error: string | null
  moderationError: ModerationErrorState | null
  clearModerationError: () => void
  addComment: (content: string) => Promise<void>
  addReply: (parentId: string, content: string) => Promise<void>
  deleteComment: (commentId: string) => Promise<void>
  refresh: () => Promise<void>
}

/**
 * Hook to manage comments for a blog post
 * Uses AI moderation via Edge Function for new comments
 * Anonymous users can comment without authentication
 */
export function useComments(postId: string): UseCommentsResult {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [moderationError, setModerationError] = useState<ModerationErrorState | null>(null)

  // Fetch comments on mount and when postId changes
  const fetchComments = useCallback(async () => {
    if (!postId) return

    setIsLoading(true)
    setError(null)

    try {
      const fetchedComments = await fetchCommentsForPost(postId)
      setComments(fetchedComments)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comments')
    } finally {
      setIsLoading(false)
    }
  }, [postId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  // Clear moderation error (called when user starts editing)
  const clearModerationError = useCallback(() => {
    setModerationError(null)
  }, [])

  // Add a new top-level comment via AI moderation
  const addComment = useCallback(
    async (content: string) => {
      console.log('[useComments] addComment called', { postId, content: content.substring(0, 20) })

      // Clear any previous moderation error
      setModerationError(null)

      try {
        console.log('[useComments] Calling submitCommentForModeration...')
        // Submit to Edge Function for AI moderation + insert
        const commentId = await submitCommentForModeration(postId, content, null)
        console.log('[useComments] Comment created with ID:', commentId)

        // Fetch the newly created comment to add to state
        const newComment = await fetchCommentById(commentId)
        if (newComment) {
          setComments((prev) => [...prev, newComment])
        }
      } catch (err) {
        if (err instanceof ModerationError) {
          // Set moderation error for UI feedback
          setModerationError({
            message: err.message,
            category: err.category
          })
        }
        throw err
      }
    },
    [postId]
  )

  // Add a reply to an existing comment via AI moderation
  const addReply = useCallback(
    async (parentId: string, content: string) => {
      // Clear any previous moderation error
      setModerationError(null)

      try {
        // Submit to Edge Function for AI moderation + insert
        const commentId = await submitCommentForModeration(postId, content, parentId)

        // Fetch the newly created reply
        const newReply = await fetchCommentById(commentId)

        if (newReply) {
          // Helper to add reply to the correct parent in the tree
          const addReplyToTree = (comments: Comment[]): Comment[] => {
            return comments.map((comment) => {
              if (comment.id === parentId) {
                return {
                  ...comment,
                  replies: [...comment.replies, newReply],
                }
              }
              if (comment.replies.length > 0) {
                return {
                  ...comment,
                  replies: addReplyToTree(comment.replies),
                }
              }
              return comment
            })
          }

          setComments((prev) => addReplyToTree(prev))
        }
      } catch (err) {
        if (err instanceof ModerationError) {
          // Set moderation error for UI feedback
          setModerationError({
            message: err.message,
            category: err.category
          })
        }
        throw err
      }
    },
    [postId]
  )

  // Delete a comment (soft delete)
  const deleteComment = useCallback(async (commentId: string) => {
    await deleteCommentQuery(commentId)

    // Update the comment in the tree
    const updateInTree = (comments: Comment[]): Comment[] => {
      return comments.map((comment) => {
        if (comment.id === commentId) {
          return { ...comment, content: '[This comment has been deleted]' }
        }
        if (comment.replies.length > 0) {
          return {
            ...comment,
            replies: updateInTree(comment.replies),
          }
        }
        return comment
      })
    }

    setComments((prev) => updateInTree(prev))
  }, [])

  return {
    comments,
    isLoading,
    error,
    moderationError,
    clearModerationError,
    addComment,
    addReply,
    deleteComment,
    refresh: fetchComments,
  }
}
