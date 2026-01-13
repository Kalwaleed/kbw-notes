export interface ModerationResult {
  approved: boolean
  commentId?: string
  rejectionReason?: string
  category?: string
}

/**
 * Custom error for moderation rejections
 */
export class ModerationError extends Error {
  category?: string

  constructor(message: string, category?: string) {
    super(message)
    this.name = 'ModerationError'
    this.category = category
  }
}

/**
 * Submit a comment for AI moderation and insertion
 * Anonymous users can comment without authentication
 * @throws ModerationError if content is rejected
 * @throws Error for other failures
 * @returns commentId if approved
 */
export async function submitCommentForModeration(
  postId: string,
  content: string,
  parentId?: string | null
): Promise<string> {
  console.log('[moderationService] submitCommentForModeration called', { postId, parentId })

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  console.log('[moderationService] Supabase URL:', supabaseUrl ? 'configured' : 'missing')
  if (!supabaseUrl) {
    throw new Error('Supabase URL not configured')
  }

  console.log('[moderationService] Fetching Edge Function...')
  const response = await fetch(
    `${supabaseUrl}/functions/v1/moderate-comment`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ postId, content, parentId: parentId || null })
    }
  )

  // Handle non-200 responses
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))

    if (response.status === 429) {
      throw new Error('Too many comments. Please wait a moment before trying again.')
    }

    throw new Error(errorData.error || 'Failed to submit comment')
  }

  const result: ModerationResult = await response.json()

  // If rejected, throw ModerationError with the reason
  if (!result.approved) {
    throw new ModerationError(
      result.rejectionReason || 'Your comment was rejected for violating community guidelines.',
      result.category
    )
  }

  // Return the comment ID for approved comments
  if (!result.commentId) {
    throw new Error('Comment approved but no ID returned')
  }

  return result.commentId
}
