import { MessageCircle, Heart, AtSign, Trash2 } from 'lucide-react'
import type { Notification, NotificationType } from '../../types/notification'

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead?: (id: string) => void
  onDelete?: (id: string) => void
  onNavigate?: (url: string) => void
}

const typeIcon: Record<NotificationType, typeof MessageCircle> = {
  comment_reply: MessageCircle,
  submission_comment: MessageCircle,
  submission_like: Heart,
  mention: AtSign,
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return 'now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onNavigate,
}: NotificationItemProps) {
  const Icon = typeIcon[notification.type]
  const isUnread = !notification.isRead

  const initials = notification.actor?.displayName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'

  const handleClick = () => {
    if (isUnread) onMarkAsRead?.(notification.id)
    if (notification.actionUrl) onNavigate?.(notification.actionUrl)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(notification.id)
  }

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick() } }}
      className="group flex items-start"
      style={{
        position: 'relative',
        gap: 'var(--space-4)',
        padding: 'var(--space-4) var(--space-5)',
        background: 'var(--color-paper)',
        borderTop: '1px solid var(--color-hair)',
        borderLeft: isUnread ? '2px solid var(--color-accent)' : '2px solid transparent',
        cursor: 'pointer',
        transition: 'background-color 100ms ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-paper-raised)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-paper)' }}
    >
      <div style={{ flexShrink: 0 }}>
        {notification.actor?.avatarUrl ? (
          <img
            src={notification.actor.avatarUrl}
            alt={notification.actor.displayName}
            style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--color-hair)' }}
          />
        ) : notification.actor ? (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'var(--color-accent-tint)',
              color: 'var(--color-ink)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-ui-sm)',
              fontWeight: 500,
              border: '1px solid var(--color-hair)',
            }}
          >
            {initials}
          </div>
        ) : (
          <div
            style={{
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-ink-muted)',
              border: '1px solid var(--color-hair)',
              borderRadius: 2,
            }}
          >
            <Icon size={16} strokeWidth={1.5} />
          </div>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-ui-base)',
            lineHeight: 1.55,
            color: 'var(--color-ink)',
            fontWeight: isUnread ? 500 : 400,
          }}
        >
          {notification.message}
        </p>
        <div
          className="flex items-center"
          style={{ gap: 8, marginTop: 4 }}
        >
          <Icon size={12} strokeWidth={1.5} style={{ color: 'var(--color-ink-soft)' }} aria-hidden="true" />
          <span
            className="font-mono uppercase"
            style={{
              fontSize: 'var(--text-mono-xs)',
              letterSpacing: '0.04em',
              color: 'var(--color-ink-soft)',
            }}
          >
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleDelete}
        aria-label="Delete notification"
        className="opacity-0 group-hover:opacity-100"
        style={{
          flexShrink: 0,
          width: 28,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          color: 'var(--color-ink-muted)',
          border: 'none',
          borderRadius: 2,
          cursor: 'pointer',
          transition: 'opacity 100ms ease, color 100ms ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-rose)' }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-ink-muted)' }}
      >
        <Trash2 size={14} strokeWidth={1.5} />
      </button>
    </div>
  )
}
