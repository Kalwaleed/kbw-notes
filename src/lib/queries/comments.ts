import { supabase } from '../supabase'
import type { Comment } from '../../components/blog-post/types'

interface DbComment {
  id: string
  post_id: string
  user_id: string | null  // null for anonymous comments
  content: string
  parent_id: string | null
  is_moderated: boolean
  created_at: string
  updated_at: string
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
        avatar: dbComment.profiles?.avatar_url ?? '',
      },
      createdAt: dbComment.created_at,
      reactions: 0,
      isModerated: dbComment.is_moderated,
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
      avatar: dbComment.profiles?.avatar_url ?? '',
    },
    createdAt: dbComment.created_at,
    reactions: 0,
    isModerated: dbComment.is_moderated,
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
      avatar: dbComment.profiles?.avatar_url ?? '',
    },
    createdAt: dbComment.created_at,
    reactions: 0,
    isModerated: dbComment.is_moderated,
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
      avatar: dbComment.profiles?.avatar_url ?? '',
    },
    createdAt: dbComment.created_at,
    reactions: 0,
    isModerated: dbComment.is_moderated,
    replies: [],
  }
}

/**
 * Delete a comment (soft delete by replacing content)
 * Only the comment owner can delete their own comments
 */
export async function deleteComment(commentId: string): Promise<void> {
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('You must be logged in to delete comments')
  }

  // Verify ownership before deleting
  const { data: comment, error: fetchError } = await supabase
    .from('comments')
    .select('user_id')
    .eq('id', commentId)
    .single()

  if (fetchError || !comment) {
    throw new Error('Comment not found')
  }

  if (comment.user_id !== user.id) {
    throw new Error('You can only delete your own comments')
  }

  // Perform soft delete
  const { error } = await supabase
    .from('comments')
    .update({
      content: '[This comment has been deleted]',
      updated_at: new Date().toISOString(),
    })
    .eq('id', commentId)

  if (error) {
    throw new Error(`Failed to delete comment: ${error.message}`)
  }
}
