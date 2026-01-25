import { supabase } from './supabase'

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
  const { data, error } = await supabase.functions.invoke('moderate-comment', {
    body: { postId, content, parentId: parentId || null }
  })

  // Handle errors from function invocation
  if (error) {
    // Try to read the error response body
    let errorMessage = error.message || 'Failed to submit comment'
    try {
      if (error.context && typeof error.context.json === 'function') {
        const errorBody = await error.context.json()
        errorMessage = errorBody.error || errorMessage
      }
    } catch {
      // Could not parse error body, use default message
    }

    if (errorMessage.includes('429') || errorMessage.includes('rate')) {
      throw new Error('Too many comments. Please wait a moment before trying again.')
    }

    throw new Error(errorMessage)
  }

  const result: ModerationResult = data

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
