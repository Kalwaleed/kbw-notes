// =============================================================================
// Data Types
// =============================================================================

export interface User {
  id: string
  name: string
  avatarUrl: string | null
}

export interface BlogPost {
  id: string
  title: string
  excerpt: string
  publishedAt: string
  author: User
  tags: string[]
  likeCount: number
  commentCount: number
  isLiked: boolean
  isBookmarked: boolean
}

// =============================================================================
// Component Props
// =============================================================================

export interface BlogFeedProps {
  /** The list of blog posts to display in the feed */
  blogPosts: BlogPost[]
  /** Called when user clicks a blog post card to view full post */
  onViewPost?: (id: string) => void
  /** Called when user likes a blog post */
  onLike?: (id: string) => void
  /** Called when user bookmarks a blog post */
  onBookmark?: (id: string) => void
  /** Called when user shares a blog post */
  onShare?: (id: string) => void
  /** Called when more posts should be loaded (infinite scroll) */
  onLoadMore?: () => void
  /** Whether more posts are currently loading */
  isLoading?: boolean
  /** Whether there are more posts to load */
  hasMore?: boolean
}

export interface BlogPostCardProps {
  post: BlogPost
  onView?: () => void
  onLike?: () => void
  onBookmark?: () => void
  onShare?: () => void
}
