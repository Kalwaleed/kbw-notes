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

// Submissions go through the submit-reader-submission Edge Function (rate-limited,
// server-side cover upload). The client no longer calls the RPC or writes to
// storage directly. `coverImageUrl` carries a `data:` URL when the reader
// attached an image; the function validates and uploads it with the service role.
export async function submitReaderSubmission(input: ReaderSubmissionInput): Promise<string> {
  const { data, error } = await supabase.functions.invoke('submit-reader-submission', {
    body: {
      submitterName: input.submitterName.trim(),
      submitterEmail: input.submitterEmail?.trim() || null,
      title: input.title.trim(),
      excerpt: input.excerpt.trim(),
      content: input.content.trim(),
      tags: normalizeTags(input.tags),
      coverImage: input.coverImageUrl?.trim() || null,
    },
  })

  if (error) {
    // Surface the function's JSON error body when available.
    let message = error.message || 'Failed to submit post'
    try {
      if (error.context && typeof error.context.json === 'function') {
        const body = await error.context.json()
        message = body.error || message
      }
    } catch {
      // fall through with the default message
    }
    throw new Error(message)
  }

  const id = (data as { id?: unknown } | null)?.id
  if (!id || typeof id !== 'string') {
    throw new Error('Submission service returned no confirmation')
  }

  return id
}
