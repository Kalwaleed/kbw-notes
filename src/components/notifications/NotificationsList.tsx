import { Bell, CheckCheck, Loader2 } from 'lucide-react'
import type { Notification } from '../../types/notification'
import { NotificationItem } from './NotificationItem'

interface NotificationsListProps {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onDelete: (id: string) => void
  onNavigate: (url: string) => void
  onSignIn: () => void
}

export function NotificationsList({
  notifications,
  unreadCount,
  isLoading,
  error,
  isAuthenticated,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onNavigate,
  onSignIn,
}: NotificationsListProps) {
  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-violet-100 dark:bg-violet-950/50 flex items-center justify-center">
          <Bell className="w-8 h-8 text-violet-500" />
        </div>
        <h3
          className="text-lg font-semibold text-slate-900 dark:text-white mb-2"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Sign in to view notifications
        </h3>
        <p
          className="text-slate-600 dark:text-slate-400 mb-4"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Get notified when someone replies to your comments or interacts with your content.
        </p>
        <button
          onClick={onSignIn}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Sign In
        </button>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center">
        <Loader2 className="w-8 h-8 mx-auto mb-4 text-violet-500 animate-spin" />
        <p
          className="text-slate-600 dark:text-slate-400"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Loading notifications...
        </p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-rose-200 dark:border-rose-800 p-8 text-center">
        <p className="text-rose-600 dark:text-rose-400" style={{ fontFamily: 'var(--font-body)' }}>
          {error}
        </p>
      </div>
    )
  }

  // Empty state
  if (notifications.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Bell className="w-8 h-8 text-slate-400 dark:text-slate-500" />
        </div>
        <h3
          className="text-lg font-semibold text-slate-900 dark:text-white mb-2"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          No notifications yet
        </h3>
        <p
          className="text-slate-600 dark:text-slate-400"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          When someone interacts with your content, you'll see it here.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
          </span>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 rounded-lg transition-colors"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Notification list */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={onMarkAsRead}
            onDelete={onDelete}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </div>
  )
}
