import { useState, useCallback, useEffect, useRef } from 'react'
import { fetchBlogPosts, type FetchPostsResult, type FeedSort } from '../lib/queries/blog'
import { publicEngagement } from '../lib/queries/engagement'
import { getAnonId } from '../lib/anonId'
import type { BlogPost } from '../types/blog'
import { useAuth } from './useAuth'
import { supabase } from '../lib/supabase'

interface UseBlogPostsOptions {
  limit?: number
  sort?: FeedSort
}

interface UseBlogPostsReturn {
  posts: BlogPost[]
  isLoading: boolean
  hasMore: boolean
  error: Error | null
  loadMore: () => void
  refresh: () => void
  updatePost: (postId: string, updates: Partial<BlogPost>) => void
  toggleLike: (postId: string) => Promise<void>
}

export function useBlogPosts({ limit = 6, sort = 'newest' }: UseBlogPostsOptions = {}): UseBlogPostsReturn {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { user } = useAuth()
  const userId = user?.id ?? null
  const cursorRef = useRef<string | null>(null)
  const isLoadingRef = useRef(false)

  // Initial load
  const loadInitial = useCallback(async () => {
    if (isLoadingRef.current) return
    isLoadingRef.current = true
    setIsLoading(true)
    setError(null)

    try {
      const result: FetchPostsResult = await fetchBlogPosts({
        limit,
        sort,
        userId: userId ?? undefined,
        anonId: userId ? undefined : getAnonId(),
      })

      setPosts(result.posts)
      cursorRef.current = result.nextCursor
      setHasMore(result.hasMore)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load posts'))
    } finally {
      setIsLoading(false)
      isLoadingRef.current = false
    }
  }, [limit, sort, userId])

  // Load more posts
  const loadMore = useCallback(async () => {
    if (isLoadingRef.current || !hasMore) return
    isLoadingRef.current = true
    setIsLoading(true)

    try {
      const result: FetchPostsResult = await fetchBlogPosts({
        limit,
        sort,
        cursor: cursorRef.current ?? undefined,
        userId: userId ?? undefined,
        anonId: userId ? undefined : getAnonId(),
      })

      setPosts((prev) => [...prev, ...result.posts])
      cursorRef.current = result.nextCursor
      setHasMore(result.hasMore)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load more posts'))
    } finally {
      setIsLoading(false)
      isLoadingRef.current = false
    }
  }, [limit, sort, hasMore, userId])

  // Refresh posts from scratch
  const refresh = useCallback(() => {
    cursorRef.current = null
    setPosts([])
    setHasMore(true)
    loadInitial()
  }, [loadInitial])

  // Update a single post (for optimistic updates)
  const updatePost = useCallback((postId: string, updates: Partial<BlogPost>) => {
    setPosts((prev) => prev.map((post) => (post.id === postId ? { ...post, ...updates } : post)))
  }, [])

  // Device-scoped like toggle via the public-engagement Edge Function, with
  // optimistic update and rollback. Post likes are device-scoped for every
  // viewer of the public blog (there are no reader accounts).
  const postsRef = useRef(posts)
  useEffect(() => { postsRef.current = posts }, [posts])
  // Per-post in-flight guard: a second click before the request settles would
  // read pre-toggle state from postsRef and double-fire the server toggle.
  const likesInFlightRef = useRef<Set<string>>(new Set())

  const toggleLike = useCallback(async (postId: string) => {
    if (likesInFlightRef.current.has(postId)) return
    const current = postsRef.current.find((p) => p.id === postId)
    if (!current) return
    likesInFlightRef.current.add(postId)

    const wasLiked = current.isLiked
    const previousCount = current.likeCount
    updatePost(postId, {
      isLiked: !wasLiked,
      likeCount: Math.max(0, previousCount + (wasLiked ? -1 : 1)),
    })

    try {
      const result = await publicEngagement('toggle_post_like', postId)
      updatePost(postId, {
        isLiked: result.liked ?? !wasLiked,
        likeCount: typeof result.count === 'number'
          ? result.count
          : Math.max(0, previousCount + (wasLiked ? -1 : 1)),
      })
    } catch (err) {
      updatePost(postId, { isLiked: wasLiked, likeCount: previousCount })
      throw err
    } finally {
      likesInFlightRef.current.delete(postId)
    }
  }, [updatePost])

  // Load initial posts on mount and when userId changes
  useEffect(() => {
    loadInitial()
  }, [loadInitial])

  // Subscribe to real-time like updates
  useEffect(() => {
    const channel = supabase
      .channel('post_likes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_likes',
        },
        (payload) => {
          const postId = (payload.new as { post_id?: string })?.post_id ?? (payload.old as { post_id?: string })?.post_id

          if (!postId) return

          // Refetch the like count for this post
          supabase
            .from('post_likes')
            .select('id', { count: 'exact' })
            .eq('post_id', postId)
            .then(({ count }) => {
              updatePost(postId, { likeCount: count ?? 0 })
            })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [updatePost])

  return {
    posts,
    isLoading: isLoading && posts.length === 0, // Only show loading on initial load
    hasMore,
    error,
    loadMore,
    refresh,
    updatePost,
    toggleLike,
  }
}
