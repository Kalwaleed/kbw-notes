import { useState, useEffect, useCallback, useRef } from 'react'
import type { Comment } from '../types/blog'
import {
  fetchVisibleCommentsForPost,
  fetchCommentById,
  fetchUserLikedCommentIds,
  deleteComment as deleteCommentQuery,
} from '../lib/queries/comments'
import { toggleEngagement } from '../lib/queries/engagement'
import { supabase } from '../lib/supabase'
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
  userLikedComments: Set<string>
  clearModerationError: () => void
  addComment: (content: string) => Promise<void>
  addReply: (parentId: string, content: string) => Promise<void>
  deleteComment: (commentId: string) => Promise<void>
  likeComment: (commentId: string) => Promise<void>
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
  const [userLikedComments, setUserLikedComments] = useState<Set<string>>(new Set())

  // Fetch comments on mount and when postId changes
  const fetchComments = useCallback(async () => {
    if (!postId) return

    setIsLoading(true)
    setError(null)

    try {
      const fetchedComments = await fetchVisibleCommentsForPost(postId)
      setComments(fetchedComments)

      // Hydrate the viewer's liked set so a reload doesn't reset the toggle.
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserLikedComments(await fetchUserLikedCommentIds(postId, user.id))
      } else {
        setUserLikedComments(new Set())
      }
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
      // Clear any previous moderation error
      setModerationError(null)

      try {
        // Submit to Edge Function for AI moderation + insert
        const commentId = await submitCommentForModeration(postId, content, null)

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

  // Refs mirror the latest state so the likeComment closure always reads
  // current values. Without these, two clicks within one render frame would
  // both read the same stale snapshot and produce inconsistent optimistic
  // updates.
  const commentsRef = useRef(comments)
  const userLikedCommentsRef = useRef(userLikedComments)
  useEffect(() => { commentsRef.current = comments }, [comments])
  useEffect(() => { userLikedCommentsRef.current = userLikedComments }, [userLikedComments])

  // Like/unlike a comment with optimistic updates
  const likeComment = useCallback(async (commentId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('You must be logged in to like comments')
    }

    const findComment = (list: Comment[]): Comment | null => {
      for (const comment of list) {
        if (comment.id === commentId) return comment
        if (comment.replies.length > 0) {
          const found = findComment(comment.replies)
          if (found) return found
        }
      }
      return null
    }

    const updateReactionsInTree = (list: Comment[], newCount: number): Comment[] => {
      return list.map((comment) => {
        if (comment.id === commentId) {
          return { ...comment, reactions: newCount }
        }
        if (comment.replies.length > 0) {
          return { ...comment, replies: updateReactionsInTree(comment.replies, newCount) }
        }
        return comment
      })
    }

    // Snapshot via refs — never closure — to avoid the stale-read race.
    const currentComment = findComment(commentsRef.current)
    const currentCount = currentComment?.reactions ?? 0
    const alreadyLiked = userLikedCommentsRef.current.has(commentId)
    const optimisticCount = alreadyLiked ? currentCount - 1 : currentCount + 1

    setComments((prev) => updateReactionsInTree(prev, optimisticCount))
    setUserLikedComments((prev) => {
      const next = new Set(prev)
      if (alreadyLiked) next.delete(commentId)
      else next.add(commentId)
      return next
    })

    try {
      const isNowLiked = await toggleEngagement('comment_like', commentId)
      const actualCount = isNowLiked ? currentCount + 1 : currentCount - 1
      setComments((prev) => updateReactionsInTree(prev, Math.max(0, actualCount)))
      setUserLikedComments((prev) => {
        const next = new Set(prev)
        if (isNowLiked) next.add(commentId)
        else next.delete(commentId)
        return next
      })
    } catch (error) {
      setComments((prev) => updateReactionsInTree(prev, currentCount))
      setUserLikedComments((prev) => {
        const next = new Set(prev)
        if (alreadyLiked) next.add(commentId)
        else next.delete(commentId)
        return next
      })
      throw error
    }
  }, [])

  return {
    comments,
    isLoading,
    error,
    moderationError,
    userLikedComments,
    clearModerationError,
    addComment,
    addReply,
    deleteComment,
    likeComment,
    refresh: fetchComments,
  }
}
