// X/Twitter Integration & Social Types

export interface XProfile {
  displayName: string
  handle: string
  avatarUrl: string
  verified: boolean
}

export interface BlogPostCard {
  id: string
  title: string
  excerpt: string
  url: string
  coverImageUrl: string
  domain: string
}

export interface TweetPreview {
  id: string
  type: 'own_post' | 'community_submission'
  tweetText: string
  blogPost: BlogPostCard
  authorTag: string | null
  characterCount: number
}

export interface Follow {
  id: string
  userId: string
  createdAt: string
}
