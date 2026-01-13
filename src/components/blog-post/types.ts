// =============================================================================
// Data Types
// =============================================================================

export interface Author {
  id: string
  name: string
  avatar: string
}

export interface Commenter {
  id: string
  name: string
  avatar: string
}

export interface Comment {
  id: string
  content: string
  commenter: Commenter
  createdAt: string
  reactions: number
  isModerated: boolean
  replies: Comment[]
}

export interface BlogPost {
  id: string
  headline: string
  subheader: string
  body: string
  author: Author
  publishedAt: string
  readingTime: number
  tags: string[]
}

// =============================================================================
// Component Props
// =============================================================================

export interface BlogPostCommentsProps {
  /** The blog post to display */
  blogPost: BlogPost
  /** The comments on the blog post */
  comments: Comment[]
  /** Whether the user is authenticated (for delete permissions, not commenting) */
  isAuthenticated?: boolean
  /** Current user's ID (for determining edit/delete permissions) */
  currentUserId?: string
  /** Set of comment IDs the current user has reacted to */
  userReactions?: Set<string>
  /** Whether comments are loading */
  isLoading?: boolean
  /** Whether there are more comments to load */
  hasMoreComments?: boolean
  /** Moderation error from AI rejection */
  moderationError?: { message: string; category?: string } | null
  /** Called to clear moderation error */
  onClearModerationError?: () => void
  /** Called when user shares the post on Twitter/X */
  onShareTwitter?: () => void
  /** Called when user shares the post on LinkedIn */
  onShareLinkedIn?: () => void
  /** Called when user copies the post link */
  onCopyLink?: () => void
  /** Called when user submits a new top-level comment */
  onAddComment?: (content: string) => Promise<void>
  /** Called when user replies to a comment */
  onReply?: (commentId: string, content: string) => Promise<void>
  /** Called when user deletes their own comment */
  onDelete?: (commentId: string) => Promise<void>
  /** Called when user reacts to a comment */
  onReact?: (commentId: string) => void
  /** Called when user reports a comment */
  onReport?: (commentId: string) => void
  /** Called when user wants to load more comments */
  onLoadMore?: () => void
  /** Called when user wants to sign in */
  onLoginClick?: () => void
}
