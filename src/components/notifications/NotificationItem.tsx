import { MessageCircle, Heart, AtSign, Trash2 } from 'lucide-react'
import type { Notification, NotificationType } from '../../types/notification'

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead?: (id: string) => void
  onDelete?: (id: string) => void
  onNavigate?: (url: string) => void
}

const typeConfig: Record<NotificationType, { icon: typeof MessageCircle; color: string }> = {
  comment_reply: { icon: MessageCircle, color: 'text-indigo-500' },
  submission_comment: { icon: MessageCircle, color: 'text-violet-500' },
  submission_like: { icon: Heart, color: 'text-rose-500' },
  mention: { icon: AtSign, color: 'text-amber-500' },
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onNavigate,
}: NotificationItemProps) {
  const { icon: Icon, color } = typeConfig[notification.type]

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Get actor initials for avatar fallback
  const initials = notification.actor?.displayName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead?.(notification.id)
    }
    if (notification.actionUrl) {
      onNavigate?.(notification.actionUrl)
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(notification.id)
  }

  return (
    <div
      onClick={handleClick}
      className={`
        group relative flex items-start gap-4 p-4 cursor-pointer transition-colors
        ${notification.isRead
          ? 'bg-white dark:bg-slate-900'
          : 'bg-violet-50/50 dark:bg-violet-950/20'
        }
        hover:bg-slate-50 dark:hover:bg-slate-800/50
      `}
    >
      {/* Unread indicator */}
      {!notification.isRead && (
        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-violet-500" />
      )}

      {/* Icon or Avatar */}
      <div className="flex-shrink-0">
        {notification.actor?.avatarUrl ? (
          <img
            src={notification.actor.avatarUrl}
            alt={notification.actor.displayName}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800"
          />
        ) : notification.actor ? (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-sm font-medium ring-2 ring-slate-100 dark:ring-slate-800">
            {initials}
          </div>
        ) : (
          <div className={`w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm ${notification.isRead ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white font-medium'}`}
          style={{ fontFamily: "'Optima', 'Segoe UI', sans-serif" }}
        >
          {notification.message}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <Icon className={`w-3.5 h-3.5 ${color}`} />
          <span
            className="text-xs text-slate-500 dark:text-slate-500"
            style={{ fontFamily: "'Optima', 'Segoe UI', sans-serif" }}
          >
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>
      </div>

      {/* Delete button */}
      <button
        onClick={handleDelete}
        className="flex-shrink-0 p-1.5 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 opacity-0 group-hover:opacity-100 transition-all"
        aria-label="Delete notification"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}
