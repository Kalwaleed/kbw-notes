import { supabase } from '../supabase'
import type { Comment } from '../../types/blog'
import type { CommentRow } from '../database.types'

/** CommentRow extended with the joined profiles relation and like aggregate */
type DbComment = CommentRow & {
  profiles: {
    id: string
    display_name: string
    avatar_url: string | null
  } | null
  comment_likes: { count: number }[] | null
}

/** Read the like count out of the embedded `comment_likes(count)` aggregate. */
function likeCountOf(dbComment: DbComment): number {
  return dbComment.comment_likes?.[0]?.count ?? 0
}

/**
 * Transform flat database comments into nested structure
 */
function buildCommentTree(flatComments: DbComment[]): Comment[] {
  const commentMap = new Map<string, Comment>()
  const rootComments: Comment[] = []

  // First pass: create all comment objects
  for (const dbComment of flatComments) {
    const comment: Comment = {
      id: dbComment.id,
      content: dbComment.content,
      commenter: {
        id: dbComment.profiles?.id ?? dbComment.user_id ?? `anon-${dbComment.id}`,
        name: dbComment.profiles?.display_name ?? 'Anonymous',
        avatarUrl: dbComment.profiles?.avatar_url ?? null,
      },
      createdAt: dbComment.created_at ?? '',
      reactions: likeCountOf(dbComment),
      isModerated: dbComment.is_moderated ?? false,
      replies: [],
    }
    commentMap.set(dbComment.id, comment)
  }

  // Second pass: build tree structure
  for (const dbComment of flatComments) {
    const comment = commentMap.get(dbComment.id)!
    if (dbComment.parent_id && commentMap.has(dbComment.parent_id)) {
      // This is a reply - add to parent's replies
      const parent = commentMap.get(dbComment.parent_id)!
      parent.replies.push(comment)
    } else {
      // This is a root comment
      rootComments.push(comment)
    }
  }

  return rootComments
}

const COMMENT_SELECT = `
  id,
  post_id,
  user_id,
  content,
  parent_id,
  is_moderated,
  created_at,
  updated_at,
  profiles:user_id (
    id,
    display_name,
    avatar_url
  ),
  comment_likes ( count )
`

/**
 * Fetch comments visible to the current viewer for a post, with nested replies.
 *
 * Visibility (`is_moderated = true` for non-admins) is enforced by RLS as of
 * migration 030. Non-admin callers will not see pending comments even if the
 * query is malformed.
 */
export async function fetchVisibleCommentsForPost(postId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select(COMMENT_SELECT)
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch comments: ${error.message}`)
  }

  if (!data || data.length === 0) {
    return []
  }

  return buildCommentTree(data as unknown as DbComment[])
}

/**
 * Fetch pending (unmoderated) comments for a post — admin-only.
 *
 * RLS gates this: non-admin callers receive an empty array. Admins receive
 * comments where `is_moderated = false`. Use this to power admin moderation
 * UI when it returns; do not expose results to non-admin readers.
 */
export async function fetchPendingCommentsForPost(postId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select(COMMENT_SELECT)
    .eq('post_id', postId)
    .eq('is_moderated', false)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch pending comments: ${error.message}`)
  }

  if (!data || data.length === 0) {
    return []
  }

  return buildCommentTree(data as unknown as DbComment[])
}

/**
 * Fetch a single comment by ID (used after moderation approval)
 */
export async function fetchCommentById(commentId: string): Promise<Comment | null> {
  const { data, error } = await supabase
    .from('comments')
    .select(COMMENT_SELECT)
    .eq('id', commentId)
    .single()

  if (error || !data) {
    return null
  }

  const dbComment = data as unknown as DbComment

  return {
    id: dbComment.id,
    content: dbComment.content,
    commenter: {
      id: dbComment.profiles?.id ?? dbComment.user_id ?? `anon-${dbComment.id}`,
      name: dbComment.profiles?.display_name ?? 'Anonymous',
      avatarUrl: dbComment.profiles?.avatar_url ?? null,
    },
    createdAt: dbComment.created_at ?? '',
    reactions: likeCountOf(dbComment),
    isModerated: dbComment.is_moderated ?? false,
    replies: [],
  }
}

/**
 * Fetch the set of comment IDs the given user has liked among a post's comments.
 * Used to hydrate optimistic like state on load so a reload doesn't reset the
 * viewer's liked/unliked toggle (which would flip a real like the wrong way).
 */
export async function fetchUserLikedCommentIds(
  postId: string,
  userId: string
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('comment_likes')
    .select('comment_id, comments!inner(post_id)')
    .eq('user_id', userId)
    .eq('comments.post_id', postId)

  if (error || !data) {
    return new Set()
  }

  return new Set((data as { comment_id: string }[]).map((row) => row.comment_id))
}

// Comment writes go through the moderate-comment edge function (service role).
// Direct client-side INSERT is blocked by RLS as of migration 020.

/**
 * Delete a comment (soft delete by replacing content)
 * Only the comment owner can delete their own comments
 *
 * Security: Uses atomic operation with ownership check in UPDATE query
 * to prevent TOCTOU (Time-of-Check to Time-of-Use) race conditions
 */
export async function deleteComment(commentId: string): Promise<void> {
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('You must be logged in to delete comments')
  }

  // Atomic operation: verify ownership AND update in single query
  // This prevents TOCTOU race conditions where ownership could change between check and update
  const { data, error } = await supabase
    .from('comments')
    .update({
      content: '[This comment has been deleted]',
      updated_at: new Date().toISOString(),
    })
    .eq('id', commentId)
    .eq('user_id', user.id)  // Ownership check in the query itself
    .select('id')

  if (error) {
    throw new Error('Failed to delete comment')
  }

  // If no rows were updated, either comment doesn't exist or user doesn't own it
  if (!data || data.length === 0) {
    throw new Error('Comment not found or you do not have permission to delete it')
  }
}

/**
 * Get like count for a comment
 */
export async function getCommentLikeCount(commentId: string): Promise<number> {
  const { count, error } = await supabase
    .from('comment_likes')
    .select('*', { count: 'exact', head: true })
    .eq('comment_id', commentId)

  if (error) return 0
  return count ?? 0
}

/**
 * Check if user has liked a comment
 */
export async function hasUserLikedComment(commentId: string, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('comment_likes')
    .select('id')
    .eq('comment_id', commentId)
    .eq('user_id', userId)
    .maybeSingle()

  return !!data
}
