// Submission Types

export type SubmissionStatus = 'pending' | 'approved' | 'rejected'

export interface Submission {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  coverImageUrl: string | null
  status: SubmissionStatus
  submittedAt: string
  updatedAt: string
  feedback: string | null
}

export interface Category {
  id: string
  name: string
  slug: string
}
