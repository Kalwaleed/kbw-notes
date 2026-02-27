import { supabase } from '../supabase'
import type { Notification, NotificationCounts } from '../../types/notification'

interface DbNotification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  is_read: boolean
  related_entity_type: string | null
  related_entity_id: string | null
  action_url: string | null
  actor_id: string | null
  created_at: string
  profiles: {
    id: string
    display_name: string
    avatar_url: string | null
  } | null
}

function transformNotification(db: DbNotification): Notification {
  return {
    id: db.id,
    userId: db.user_id,
    type: db.type as Notification['type'],
    title: db.title,
    message: db.message,
    isRead: db.is_read,
    relatedEntityType: db.related_entity_type,
    relatedEntityId: db.related_entity_id,
    actionUrl: db.action_url,
    actor: db.profiles
      ? {
          id: db.profiles.id,
          displayName: db.profiles.display_name,
          avatarUrl: db.profiles.avatar_url,
        }
      : null,
    createdAt: db.created_at,
  }
}

/**
 * Fetch notifications for the current user
 * Requires authentication - uses explicit user_id filter for defense-in-depth
 */
export async function fetchNotifications(
  limit = 50,
  offset = 0
): Promise<Notification[]> {
  // Get current user for explicit filtering (defense-in-depth, RLS is backup)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Must be logged in to view notifications')
  }

  const { data, error } = await supabase
    .from('notifications')
    .select(`
      id,
      user_id,
      type,
      title,
      message,
      is_read,
      related_entity_type,
      related_entity_id,
      action_url,
      actor_id,
      created_at,
      profiles:actor_id (
        id,
        display_name,
        avatar_url
      )
    `)
    .eq('user_id', user.id) // Explicit filter for defense-in-depth
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    throw new Error(`Failed to fetch notifications: ${error.message}`)
  }

  return (data as unknown as DbNotification[]).map(transformNotification)
}

/**
 * Get unread notification count for the current user
 * Requires authentication - uses explicit user_id filter for defense-in-depth
 */
export async function fetchUnreadCount(): Promise<number> {
  // Get current user for explicit filtering
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return 0 // Return 0 for unauthenticated users
  }

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id) // Explicit filter for defense-in-depth
    .eq('is_read', false)

  if (error) {
    throw new Error(`Failed to fetch unread count: ${error.message}`)
  }

  return count ?? 0
}

/**
 * Get notification counts (total and unread)
 * Requires authentication - uses explicit user_id filter for defense-in-depth
 */
export async function fetchNotificationCounts(): Promise<NotificationCounts> {
  // Get current user for explicit filtering
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { total: 0, unread: 0 }
  }

  const [totalResult, unreadResult] = await Promise.all([
    supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id), // Explicit filter
    supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id) // Explicit filter
      .eq('is_read', false),
  ])

  if (totalResult.error) {
    throw new Error(`Failed to fetch total count: ${totalResult.error.message}`)
  }

  if (unreadResult.error) {
    throw new Error(`Failed to fetch unread count: ${unreadResult.error.message}`)
  }

  return {
    total: totalResult.count ?? 0,
    unread: unreadResult.count ?? 0,
  }
}

/**
 * Mark a notification as read
 * Requires authentication - uses explicit user_id filter for defense-in-depth
 */
export async function markAsRead(notificationId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Must be logged in to mark notifications as read')
  }

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', user.id)

  if (error) {
    throw new Error(`Failed to mark notification as read: ${error.message}`)
  }
}

/**
 * Mark all notifications as read for the current user
 */
export async function markAllAsRead(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Must be logged in to mark notifications as read')
  }

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  if (error) {
    throw new Error(`Failed to mark all notifications as read: ${error.message}`)
  }
}

/**
 * Delete a notification
 * Requires authentication - uses explicit user_id filter for defense-in-depth
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Must be logged in to delete notifications')
  }

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)
    .eq('user_id', user.id)

  if (error) {
    throw new Error(`Failed to delete notification: ${error.message}`)
  }
}
