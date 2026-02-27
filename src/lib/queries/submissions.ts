import DOMPurify from 'dompurify'
import { supabase } from '../supabase'
import type { Submission, SubmissionFormData, SubmissionStatus } from '../../types/submission'
import type { SubmissionRow, TablesUpdate } from '../database.types'

interface FetchSubmissionsOptions {
  authorId: string
  status?: SubmissionStatus | 'all'
}

/**
 * Fetch all submissions for a user
 */
export async function fetchSubmissions({
  authorId,
  status = 'all',
}: FetchSubmissionsOptions): Promise<Submission[]> {
  let query = supabase
    .from('submissions')
    .select('*')
    .eq('author_id', authorId)
    .order('updated_at', { ascending: false })

  if (status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch submissions: ${error.message}`)
  }

  return (data ?? []).map(transformSubmission)
}

/**
 * Fetch a single submission by ID
 */
export async function fetchSubmission(id: string): Promise<Submission | null> {
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    throw new Error(`Failed to fetch submission: ${error.message}`)
  }

  return transformSubmission(data)
}

/**
 * Create a new submission (draft)
 */
export async function createSubmission(authorId: string): Promise<Submission> {
  const { data, error } = await supabase
    .from('submissions')
    .insert({
      author_id: authorId,
      title: '',
      excerpt: '',
      content: '',
      tags: [],
      status: 'draft',
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create submission: ${error.message}`)
  }

  return transformSubmission(data)
}

/**
 * Update a submission
 */
export async function updateSubmission(
  id: string,
  data: Partial<SubmissionFormData>
): Promise<Submission> {
  const updateData: TablesUpdate<'submissions'> = {}

  if (data.title !== undefined) updateData.title = data.title
  if (data.excerpt !== undefined) updateData.excerpt = data.excerpt
  if (data.content !== undefined) updateData.content = DOMPurify.sanitize(data.content)
  if (data.coverImageUrl !== undefined) updateData.cover_image_url = data.coverImageUrl
  if (data.tags !== undefined) updateData.tags = data.tags

  const { data: result, error } = await supabase
    .from('submissions')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update submission: ${error.message}`)
  }

  return transformSubmission(result)
}

/**
 * Publish a submission (changes status to 'published')
 */
export async function publishSubmission(id: string): Promise<Submission> {
  const { data, error } = await supabase
    .from('submissions')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to publish submission: ${error.message}`)
  }

  return transformSubmission(data)
}

/**
 * Unpublish a submission (changes status back to 'draft')
 */
export async function unpublishSubmission(id: string): Promise<Submission> {
  const { data, error } = await supabase
    .from('submissions')
    .update({
      status: 'draft',
      published_at: null,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to unpublish submission: ${error.message}`)
  }

  return transformSubmission(data)
}

/**
 * Delete a submission
 */
export async function deleteSubmission(id: string): Promise<void> {
  const { error } = await supabase.from('submissions').delete().eq('id', id)

  if (error) {
    throw new Error(`Failed to delete submission: ${error.message}`)
  }
}

/**
 * Fetch all unique tags from existing submissions and blog posts
 */
export async function fetchAllTags(): Promise<string[]> {
  const [submissionsResult, postsResult] = await Promise.all([
    supabase.from('submissions').select('tags'),
    supabase.from('blog_posts').select('tags'),
  ])

  const allTags = new Set<string>()

  submissionsResult.data?.forEach((s) => {
    s.tags?.forEach((tag: string) => allTags.add(tag))
  })

  postsResult.data?.forEach((p) => {
    p.tags?.forEach((tag: string) => allTags.add(tag))
  })

  return Array.from(allTags).sort()
}

// Transform database row to Submission type
function transformSubmission(row: SubmissionRow): Submission {
  return {
    id: row.id,
    authorId: row.author_id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt ?? '',
    content: row.content ?? '',
    coverImageUrl: row.cover_image_url,
    tags: row.tags ?? [],
    status: (row.status ?? 'draft') as SubmissionStatus,
    publishedAt: row.published_at,
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
  }
}
