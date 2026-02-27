import { supabase } from '../supabase'
import type { Comment } from '../../types/blog'
import type { CommentRow } from '../database.types'

/** CommentRow extended with the joined profiles relation */
type DbComment = CommentRow & {
  profiles: {
    id: string
    display_name: string
    avatar_url: string | null
  } | null
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
      reactions: 0,
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

/**
 * Fetch all comments for a post with nested replies
 */
export async function fetchCommentsForPost(postId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select(`
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
      )
    `)
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
 * Fetch a single comment by ID (used after moderation approval)
 */
export async function fetchCommentById(commentId: string): Promise<Comment | null> {
  const { data, error } = await supabase
    .from('comments')
    .select(`
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
      )
    `)
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
    reactions: 0,
    isModerated: dbComment.is_moderated ?? false,
    replies: [],
  }
}

/**
 * Add a new top-level comment
 * @param isModerated - true if content passed moderation, false if flagged for review
 */
export async function addComment(
  postId: string,
  userId: string,
  content: string,
  isModerated: boolean
): Promise<Comment> {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      user_id: userId,
      content: content.trim(),
      is_moderated: isModerated,
    })
    .select(`
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
      )
    `)
    .single()

  if (error) {
    throw new Error(`Failed to add comment: ${error.message}`)
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
    reactions: 0,
    isModerated: dbComment.is_moderated ?? false,
    replies: [],
  }
}

/**
 * Add a reply to an existing comment
 * @param isModerated - true if content passed moderation, false if flagged for review
 */
export async function addReply(
  postId: string,
  parentId: string,
  userId: string,
  content: string,
  isModerated: boolean
): Promise<Comment> {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      user_id: userId,
      content: content.trim(),
      parent_id: parentId,
      is_moderated: isModerated,
    })
    .select(`
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
      )
    `)
    .single()

  if (error) {
    throw new Error(`Failed to add reply: ${error.message}`)
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
    reactions: 0,
    isModerated: dbComment.is_moderated ?? false,
    replies: [],
  }
}

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
 * Toggle like on a comment
 * Returns true if now liked, false if unliked
 */
export async function toggleCommentLike(commentId: string, userId: string): Promise<boolean> {
  // Check if already liked (use maybeSingle to avoid error when no rows)
  const { data: existing, error: selectError } = await supabase
    .from('comment_likes')
    .select('id')
    .eq('comment_id', commentId)
    .eq('user_id', userId)
    .maybeSingle()

  if (selectError) {
    throw new Error(`Failed to check like status: ${selectError.message}`)
  }

  if (existing) {
    // Unlike
    const { error } = await supabase
      .from('comment_likes')
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', userId)

    if (error) throw new Error(`Failed to unlike comment: ${error.message}`)
    return false
  } else {
    // Like
    const { error } = await supabase
      .from('comment_likes')
      .insert({
        comment_id: commentId,
        user_id: userId,
      })

    if (error) throw new Error(`Failed to like comment: ${error.message}`)
    return true
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
    .single()

  return !!data
}
