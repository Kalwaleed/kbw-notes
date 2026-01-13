import { useState, useCallback, useEffect, useRef } from 'react'
import { fetchBlogPosts, type FetchPostsResult } from '../lib/queries/blog'
import type { BlogPost } from '../components/blog-feed/types'
import { supabase } from '../lib/supabase'

interface UseBlogPostsOptions {
  limit?: number
}

interface UseBlogPostsReturn {
  posts: BlogPost[]
  isLoading: boolean
  hasMore: boolean
  error: Error | null
  loadMore: () => void
  refresh: () => void
  updatePost: (postId: string, updates: Partial<BlogPost>) => void
}

export function useBlogPosts({ limit = 6 }: UseBlogPostsOptions = {}): UseBlogPostsReturn {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const cursorRef = useRef<string | null>(null)
  const isLoadingRef = useRef(false)

  // Get current user ID
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Initial load
  const loadInitial = useCallback(async () => {
    if (isLoadingRef.current) return
    isLoadingRef.current = true
    setIsLoading(true)
    setError(null)

    try {
      const result: FetchPostsResult = await fetchBlogPosts({
        limit,
        userId: userId ?? undefined,
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
  }, [limit, userId])

  // Load more posts
  const loadMore = useCallback(async () => {
    if (isLoadingRef.current || !hasMore) return
    isLoadingRef.current = true
    setIsLoading(true)

    try {
      const result: FetchPostsResult = await fetchBlogPosts({
        limit,
        cursor: cursorRef.current ?? undefined,
        userId: userId ?? undefined,
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
  }, [limit, hasMore, userId])

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
  }
}
