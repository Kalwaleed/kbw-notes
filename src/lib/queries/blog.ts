import { supabase } from '../supabase'
import type { BlogPost } from '../../types/blog'
import { isLocalAuthBypassEnabled, localDevUser } from '../localDev'

// One-time public reset requested on 2026-04-30: hide legacy published rows
// unless/until the matching cleanup migration is applied to the database.
const PUBLIC_FEED_RESET_AT = '2026-04-30T10:00:28.000Z'
const LOCAL_DEV_SAMPLE_POSTS: Array<BlogPost & { content: string }> = [
  {
    id: 'local-post-001',
    title: 'The Advantage Is the Operating System',
    excerpt: 'Capital is abundant. The scarce layer is the operating system that turns capital, access, and timing into repeatable execution.',
    content: `
      <p>Capital is rarely the constraint by itself. The constraint is the operating system around it: how opportunities are sourced, filtered, staffed, governed, and compounded after the first transaction closes.</p>
      <h2>Control Before Optionality</h2>
      <p>Minority exposure can produce mark-to-market gains, but it rarely produces platform control. The more durable position is ownership of the bottleneck: distribution, approvals, data, brand trust, or the operating team that can repeatedly convert intent into revenue.</p>
      <h2>What Compounds</h2>
      <p>The strongest platforms turn each transaction into better access for the next transaction. They do not just accumulate assets. They accumulate permissions, judgment, and execution speed.</p>
      <h3>Practical Test</h3>
      <p>If a deal does not improve future sourcing, governance, or margin protection, it is probably a trade, not a platform move.</p>
    `,
    coverImageUrl: 'https://picsum.photos/id/1011/1600/900',
    author: {
      id: localDevUser.id,
      name: 'KBW Notes',
      avatarUrl: null,
    },
    publishedAt: '2026-04-30T10:35:00.000Z',
    tags: ['strategy', 'platforms', 'capital'],
    likeCount: 18,
    commentCount: 0,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: 'local-post-002',
    title: 'A Useful AI Tool Has a P&L Shape',
    excerpt: 'The first test for AI inside an operating company is not whether it feels impressive. It is whether the tool has a measurable cost, speed, or quality delta.',
    content: `
      <p>Most AI pilots fail because they are evaluated as demos instead of operating instruments. A useful tool has a P&amp;L shape. It removes a cost line, compresses a cycle time, raises conversion, or protects margin.</p>
      <h2>The Wrong Question</h2>
      <p>“Can AI do this?” is too loose. The sharper question is: “Can this workflow move from three hours to twenty minutes without increasing review risk?” That gives the team a measurable standard.</p>
      <h2>Where to Start</h2>
      <p>Start with repeated workflows that already have human review: document intake, meeting synthesis, vendor comparisons, customer response drafts, and data cleanup. The review layer already exists, which lowers implementation risk.</p>
      <h3>Deployment Rule</h3>
      <p>If the same prompt is used twice, turn it into a controlled workflow with inputs, outputs, owner, and failure handling.</p>
    `,
    coverImageUrl: 'https://picsum.photos/id/180/1600/900',
    author: {
      id: localDevUser.id,
      name: 'KBW Notes',
      avatarUrl: null,
    },
    publishedAt: '2026-04-30T10:30:00.000Z',
    tags: ['ai', 'operations', 'automation'],
    likeCount: 12,
    commentCount: 0,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: 'local-post-003',
    title: 'Premium Positioning Is an Operating Choice',
    excerpt: 'Premium brands are not built by aesthetic decisions alone. They are built by refusing shortcuts that would train the market to expect discount economics.',
    content: `
      <p>Premium positioning looks like brand from the outside, but internally it is an operating discipline. It determines what you refuse, how you price, how quickly you respond, and which compromises are never normalized.</p>
      <h2>Margin Is a Signal</h2>
      <p>Discounting may solve a quarterly pressure point, but it can also teach the market to wait. A premium platform has to protect price integrity even when demand is soft, then use product quality, service reliability, and scarcity to justify that protection.</p>
      <h2>Execution Details Matter</h2>
      <p>Every touchpoint either supports the premium claim or weakens it: onboarding, handover, maintenance, event programming, communication cadence, and how exceptions are handled.</p>
      <h3>The Test</h3>
      <p>If a customer can feel operational looseness after purchase, the brand promise was overdrawn.</p>
    `,
    coverImageUrl: 'https://picsum.photos/id/1031/1600/900',
    author: {
      id: localDevUser.id,
      name: 'KBW Notes',
      avatarUrl: null,
    },
    publishedAt: '2026-04-30T10:25:00.000Z',
    tags: ['brand', 'real-estate', 'margin'],
    likeCount: 21,
    commentCount: 0,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: 'local-post-004',
    title: 'The MENA Gap Is Not Demand',
    excerpt: 'In many categories, demand already exists. The open space is institutional-grade execution: trust, governance, distribution, and repeatability.',
    content: `
      <p>The MENA opportunity is often described as a demand story. That is incomplete. In many categories, the demand is visible; what remains underbuilt is the institutional machinery around the demand.</p>
      <h2>Execution Is the Gap</h2>
      <p>Consumers, corporates, and governments are moving faster than many category operators. That creates room for platforms that can combine local trust, global standards, and repeatable delivery.</p>
      <h2>Why Timing Matters</h2>
      <p>Vision 2030 has changed the tempo of market formation. Regulatory clarity, infrastructure spend, tourism, sport, and demographic energy are converging. The window rewards builders who can move before categories harden.</p>
      <h3>Investor Discipline</h3>
      <p>Do not underwrite the region in aggregate. Underwrite the exact bottleneck a company controls.</p>
    `,
    coverImageUrl: 'https://picsum.photos/id/1018/1600/900',
    author: {
      id: localDevUser.id,
      name: 'KBW Notes',
      avatarUrl: null,
    },
    publishedAt: '2026-04-30T10:20:00.000Z',
    tags: ['mena', 'vision-2030', 'markets'],
    likeCount: 16,
    commentCount: 0,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: 'local-post-005',
    title: 'Meetings Should End in a System Update',
    excerpt: 'If a meeting does not change an owner, deadline, metric, decision, or document, the work was not finished.',
    content: `
      <p>A meeting is not a unit of progress. It is a coordination cost that only earns its place when it changes the system: an owner, deadline, metric, decision, document, or operating rule.</p>
      <h2>The Minimum Output</h2>
      <p>Every serious meeting should leave behind a written artifact. It can be brief, but it should make the next action unambiguous. Who owns it? What moves? By when? What happens if it slips?</p>
      <h2>Why This Compounds</h2>
      <p>Clear follow-through creates institutional memory. Over time, the organization becomes easier to run because decisions stop living inside private recollection.</p>
      <h3>Rule</h3>
      <p>If the same discussion repeats three times, the problem is not alignment. The problem is missing process ownership.</p>
    `,
    coverImageUrl: 'https://picsum.photos/id/1076/1600/900',
    author: {
      id: localDevUser.id,
      name: 'KBW Notes',
      avatarUrl: null,
    },
    publishedAt: '2026-04-30T10:15:00.000Z',
    tags: ['operator-notes', 'management', 'systems'],
    likeCount: 9,
    commentCount: 0,
    isLiked: false,
    isBookmarked: false,
  },
]

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
  if (isLocalAuthBypassEnabled) {
    const posts = [...LOCAL_DEV_SAMPLE_POSTS].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    const visiblePosts = cursor
      ? posts.filter((post) => post.publishedAt < cursor)
      : posts
    const page = visiblePosts.slice(0, limit)
    const hasMore = visiblePosts.length > limit
    return {
      posts: page,
      nextCursor: hasMore ? page[page.length - 1]?.publishedAt ?? null : null,
      hasMore,
    }
  }

  // Build query for published submissions with author info
  let query = supabase
    .from('submissions')
    .select(
      `
      id,
      title,
      excerpt,
      cover_image_url,
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
    .gte('published_at', PUBLIC_FEED_RESET_AT)
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
      coverImageUrl: post.cover_image_url ?? null,
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
    .maybeSingle()

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
  coverImageUrl: string | null
  content: string
  publishedAt: string
  tags: string[]
  author: {
    id: string
    name: string
    avatarUrl: string | null
  }
} | null> {
  if (isLocalAuthBypassEnabled) {
    const post = LOCAL_DEV_SAMPLE_POSTS.find((samplePost) => samplePost.id === postId)
    if (!post) return null
    return {
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      coverImageUrl: post.coverImageUrl ?? null,
      content: post.content,
      publishedAt: post.publishedAt,
      tags: post.tags,
      author: post.author,
    }
  }

  const { data, error } = await supabase
    .from('submissions')
    .select(
      `
      id,
      title,
      excerpt,
      cover_image_url,
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
    .gte('published_at', PUBLIC_FEED_RESET_AT)
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
    coverImageUrl: data.cover_image_url ?? null,
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
/**
 * Get like count for a post
 */
export async function getPostLikeCount(postId: string): Promise<number> {
  const { count, error } = await supabase
    .from('post_likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId)

  if (error) return 0
  return count ?? 0
}

export async function toggleBookmark(postId: string, userId: string): Promise<boolean> {
  // Check if already bookmarked
  const { data: existing } = await supabase
    .from('post_bookmarks')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle()

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
