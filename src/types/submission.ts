// Submission Types

export type SubmissionStatus = 'draft' | 'published'

export interface Submission {
  id: string
  authorId: string
  title: string
  slug: string | null
  excerpt: string
  content: string
  coverImageUrl: string | null
  tags: string[]
  status: SubmissionStatus
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface SubmissionFormData {
  title: string
  excerpt: string
  content: string
  coverImageUrl: string | null
  tags: string[]
}

export interface SubmissionListFilter {
  status?: SubmissionStatus | 'all'
}
