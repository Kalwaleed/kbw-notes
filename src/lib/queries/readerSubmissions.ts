import { supabase } from '../supabase'

export interface ReaderSubmissionInput {
  submitterName: string
  submitterEmail?: string
  title: string
  excerpt: string
  content: string
  coverImageUrl?: string
  tags: string[]
}

function normalizeTags(tags: string[]): string[] {
  return Array.from(
    new Set(
      tags
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean)
    )
  ).slice(0, 8)
}

export async function submitReaderSubmission(input: ReaderSubmissionInput): Promise<string> {
  const { data, error } = await supabase.rpc('submit_reader_submission' as never, {
    p_submitter_name: input.submitterName.trim(),
    p_submitter_email: input.submitterEmail?.trim() || null,
    p_title: input.title.trim(),
    p_excerpt: input.excerpt.trim(),
    p_content: input.content.trim(),
    p_tags: normalizeTags(input.tags),
    p_cover_image_url: input.coverImageUrl?.trim() || null,
  } as never)

  if (error) {
    throw new Error(error.message || 'Failed to submit post')
  }

  if (!data || typeof data !== 'string') {
    throw new Error('Submission service returned no confirmation')
  }

  return data
}
