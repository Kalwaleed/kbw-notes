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
  editCount: number
  editsRemaining: number
}

export const PUBLISHED_EDIT_CAP = 3

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
