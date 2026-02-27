// Blog Posts & Comments Types — single source of truth for data types

export interface Author {
  id: string
  name: string
  avatarUrl: string | null
}

export interface BlogPost {
  id: string
  title: string
  excerpt: string
  content?: string
  author: Author
  publishedAt: string
  readingTime?: number
  tags: string[]
  likeCount: number
  commentCount: number
  isLiked?: boolean
  isBookmarked?: boolean
}

export interface Commenter {
  id: string
  name: string
  avatarUrl: string | null
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
