import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Notification } from '../types/notification'
import {
  fetchNotifications,
  fetchUnreadCount,
  markAsRead as markAsReadQuery,
  markAllAsRead as markAllAsReadQuery,
  deleteNotification as deleteNotificationQuery,
} from '../lib/queries/notifications'
import { useAuth } from './useAuth'

interface UseNotificationsResult {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (notificationId: string) => Promise<void>
  refresh: () => Promise<void>
}

/**
 * Hook to manage notifications for the current user
 * Includes realtime subscription for new notifications
 */
export function useNotifications(): UseNotificationsResult {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch notifications
  const loadNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([])
      setUnreadCount(0)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const [notifs, count] = await Promise.all([
        fetchNotifications(),
        fetchUnreadCount(),
      ])
      setNotifications(notifs)
      setUnreadCount(count)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Initial load
  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  // Realtime subscription
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        async () => {
          // Refresh notifications when a new one arrives
          await loadNotifications()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, loadNotifications])

  // Mark single notification as read
  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await markAsReadQuery(notificationId)
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to mark as read')
        throw err
      }
    },
    []
  )

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await markAllAsReadQuery()
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      )
      setUnreadCount(0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all as read')
      throw err
    }
  }, [])

  // Delete a notification
  const deleteNotification = useCallback(
    async (notificationId: string) => {
      const notification = notifications.find((n) => n.id === notificationId)

      try {
        await deleteNotificationQuery(notificationId)
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
        if (notification && !notification.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete notification')
        throw err
      }
    },
    [notifications]
  )

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh: loadNotifications,
  }
}

/**
 * Lightweight hook for just the unread count
 * Used for the navigation badge
 */
export function useUnreadCount(): { count: number; isLoading: boolean } {
  const { user } = useAuth()
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setCount(0)
      setIsLoading(false)
      return
    }

    const loadCount = async () => {
      try {
        const unread = await fetchUnreadCount()
        setCount(unread)
      } catch {
        // Silently fail for badge - don't break the UI
        setCount(0)
      } finally {
        setIsLoading(false)
      }
    }

    loadCount()

    // Subscribe to changes
    const channel = supabase
      .channel('unread-count-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        async () => {
          const unread = await fetchUnreadCount()
          setCount(unread)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  return { count, isLoading }
}
