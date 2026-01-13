import { useState, useCallback } from 'react'
import { toggleLike as toggleLikeApi, toggleBookmark as toggleBookmarkApi } from '../lib/queries/blog'
import { useAuth } from './useAuth'

interface UsePostEngagementReturn {
  toggleLike: (postId: string, onSuccess?: (isLiked: boolean) => void) => Promise<void>
  toggleBookmark: (postId: string, onSuccess?: (isBookmarked: boolean) => void) => Promise<void>
  isLiking: string | null
  isBookmarking: string | null
  error: Error | null
}

export function usePostEngagement(): UsePostEngagementReturn {
  const { user } = useAuth()
  const [isLiking, setIsLiking] = useState<string | null>(null)
  const [isBookmarking, setIsBookmarking] = useState<string | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const toggleLike = useCallback(
    async (postId: string, onSuccess?: (isLiked: boolean) => void) => {
      if (!user) {
        // Will be handled by the page - redirect to login
        return
      }

      if (isLiking) return // Prevent double-clicks

      setIsLiking(postId)
      setError(null)

      try {
        const isNowLiked = await toggleLikeApi(postId, user.id)
        onSuccess?.(isNowLiked)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to toggle like'))
      } finally {
        setIsLiking(null)
      }
    },
    [user, isLiking]
  )

  const toggleBookmark = useCallback(
    async (postId: string, onSuccess?: (isBookmarked: boolean) => void) => {
      if (!user) {
        // Will be handled by the page - redirect to login
        return
      }

      if (isBookmarking) return // Prevent double-clicks

      setIsBookmarking(postId)
      setError(null)

      try {
        const isNowBookmarked = await toggleBookmarkApi(postId, user.id)
        onSuccess?.(isNowBookmarked)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to toggle bookmark'))
      } finally {
        setIsBookmarking(null)
      }
    },
    [user, isBookmarking]
  )

  return {
    toggleLike,
    toggleBookmark,
    isLiking,
    isBookmarking,
    error,
  }
}
