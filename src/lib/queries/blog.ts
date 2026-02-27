import { supabase } from '../supabase'
import type { BlogPost } from '../../types/blog'

export interface FetchPostsOptions {
  limit?: number
  cursor?: string // publishedAt timestamp for cursor-based pagination
  userId?: string // Current user ID for isLiked/isBookmarked
}

export interface FetchPostsResult {
  posts: BlogPost[]
  nextCursor: string | null
  hasMore: boolean
}

/**
 * Fetch blog posts with cursor-based pagination
 * Reads from submissions table where status='published'
 */
export async function fetchBlogPosts({
  limit = 6,
  cursor,
  userId,
}: FetchPostsOptions = {}): Promise<FetchPostsResult> {
  // Build query for published submissions with author info
  let query = supabase
    .from('submissions')
    .select(
      `
      id,
      title,
      excerpt,
      published_at,
      tags,
      author:profiles!author_id (
        id,
        display_name,
        avatar_url
      )
    `
    )
    .eq('status', 'published')
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(limit + 1) // Fetch one extra to check if there are more

  // Apply cursor for pagination
  if (cursor) {
    query = query.lt('published_at', cursor)
  }

  const { data: postsData, error: postsError } = await query

  if (postsError) {
    throw new Error(`Failed to fetch posts: ${postsError.message}`)
  }

  if (!postsData || postsData.length === 0) {
    return { posts: [], nextCursor: null, hasMore: false }
  }

  // Check if there are more posts
  const hasMore = postsData.length > limit
  const posts = hasMore ? postsData.slice(0, limit) : postsData

  // Get post IDs for likes and comments counts
  const postIds = posts.map((p) => p.id)

  // Fetch like counts (from submission_likes if exists, otherwise empty)
  const { data: likeCounts } = await supabase
    .from('post_likes')
    .select('post_id')
    .in('post_id', postIds)

  // Fetch comment counts
  const { data: commentCounts } = await supabase
    .from('comments')
    .select('post_id')
    .in('post_id', postIds)

  // If user is logged in, fetch their likes and bookmarks
  let userLikes: string[] = []
  let userBookmarks: string[] = []

  if (userId) {
    const [likesResult, bookmarksResult] = await Promise.all([
      supabase.from('post_likes').select('post_id').eq('user_id', userId).in('post_id', postIds),
      supabase
        .from('post_bookmarks')
        .select('post_id')
        .eq('user_id', userId)
        .in('post_id', postIds),
    ])

    userLikes = likesResult.data?.map((l) => l.post_id) ?? []
    userBookmarks = bookmarksResult.data?.map((b) => b.post_id) ?? []
  }

  // Count likes and comments per post
  const likeCountMap = new Map<string, number>()
  const commentCountMap = new Map<string, number>()

  likeCounts?.forEach((l) => {
    likeCountMap.set(l.post_id, (likeCountMap.get(l.post_id) ?? 0) + 1)
  })

  commentCounts?.forEach((c) => {
    commentCountMap.set(c.post_id, (commentCountMap.get(c.post_id) ?? 0) + 1)
  })

  // Transform to BlogPost type
  const transformedPosts: BlogPost[] = posts.map((post) => {
    const author = Array.isArray(post.author) ? post.author[0] : post.author
    return {
      id: post.id,
      title: post.title,
      excerpt: post.excerpt ?? '',
      publishedAt: post.published_at!,
      tags: post.tags ?? [],
      author: {
        id: author?.id ?? '',
        name: author?.display_name ?? 'Anonymous',
        avatarUrl: author?.avatar_url ?? null,
      },
      likeCount: likeCountMap.get(post.id) ?? 0,
      commentCount: commentCountMap.get(post.id) ?? 0,
      isLiked: userLikes.includes(post.id),
      isBookmarked: userBookmarks.includes(post.id),
    }
  })

  // Get next cursor from the last post
  const lastPost = posts[posts.length - 1]
  const nextCursor = hasMore ? lastPost.published_at : null

  return {
    posts: transformedPosts,
    nextCursor,
    hasMore,
  }
}

/**
 * Toggle like on a post
 */
export async function toggleLike(postId: string, userId: string): Promise<boolean> {
  // Check if already liked
  const { data: existing } = await supabase
    .from('post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single()

  if (existing) {
    // Unlike
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId)

    if (error) throw new Error(`Failed to unlike: ${error.message}`)
    return false // Now unliked
  } else {
    // Like
    const { error } = await supabase.from('post_likes').insert({
      post_id: postId,
      user_id: userId,
    })

    if (error) throw new Error(`Failed to like: ${error.message}`)
    return true // Now liked
  }
}

/**
 * Fetch a single blog post by ID (from submissions table)
 */
export async function fetchBlogPost(postId: string): Promise<{
  id: string
  title: string
  excerpt: string
  content: string
  publishedAt: string
  tags: string[]
  author: {
    id: string
    name: string
    avatarUrl: string | null
  }
} | null> {
  const { data, error } = await supabase
    .from('submissions')
    .select(
      `
      id,
      title,
      excerpt,
      content,
      published_at,
      tags,
      author:profiles!author_id (
        id,
        display_name,
        avatar_url
      )
    `
    )
    .eq('id', postId)
    .eq('status', 'published')
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    throw new Error(`Failed to fetch post: ${error.message}`)
  }

  const author = Array.isArray(data.author) ? data.author[0] : data.author

  return {
    id: data.id,
    title: data.title,
    excerpt: data.excerpt ?? '',
    content: data.content ?? '',
    publishedAt: data.published_at!,
    tags: data.tags ?? [],
    author: {
      id: author?.id ?? '',
      name: author?.display_name ?? 'Anonymous',
      avatarUrl: author?.avatar_url ?? null,
    },
  }
}

/**
 * Toggle bookmark on a post
 */
export async function toggleBookmark(postId: string, userId: string): Promise<boolean> {
  // Check if already bookmarked
  const { data: existing } = await supabase
    .from('post_bookmarks')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single()

  if (existing) {
    // Remove bookmark
    const { error } = await supabase
      .from('post_bookmarks')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId)

    if (error) throw new Error(`Failed to remove bookmark: ${error.message}`)
    return false // Now unbookmarked
  } else {
    // Add bookmark
    const { error } = await supabase.from('post_bookmarks').insert({
      post_id: postId,
      user_id: userId,
    })

    if (error) throw new Error(`Failed to bookmark: ${error.message}`)
    return true // Now bookmarked
  }
}
