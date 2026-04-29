import { Bell, CheckCheck } from 'lucide-react'
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
  if (!isAuthenticated) {
    return (
      <EmptyShell
        icon={Bell}
        kicker="Access · required"
        title="Sign in to view notifications."
        description="When someone replies to your comments or interacts with your work, it lands here."
      >
        <button
          type="button"
          onClick={onSignIn}
          className="font-mono uppercase"
          style={{
            fontSize: 'var(--text-mono-sm)',
            fontWeight: 600,
            letterSpacing: '0.04em',
            background: 'var(--color-ink)',
            color: 'var(--color-paper)',
            border: 'none',
            borderRadius: 2,
            padding: '10px 16px',
            cursor: 'pointer',
          }}
        >
          Sign in
        </button>
      </EmptyShell>
    )
  }

  if (isLoading) {
    return (
      <div
        style={{
          padding: 'var(--space-9) var(--space-5)',
          textAlign: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-mono-xs)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--color-ink-soft)',
        }}
      >
        Loading notifications…
      </div>
    )
  }

  if (error) {
    return (
      <div
        role="alert"
        style={{
          padding: 'var(--space-5)',
          background: 'var(--color-rose-tint)',
          borderLeft: '2px solid var(--color-rose)',
          fontFamily: 'var(--font-sans)',
          fontStyle: 'italic',
          fontSize: 'var(--text-ui-base)',
          color: 'var(--color-rose)',
        }}
      >
        {error}
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <EmptyShell
        icon={Bell}
        kicker="Inbox · empty"
        title="No notifications yet."
        description="When someone interacts with your content, you'll see it here."
      />
    )
  }

  return (
    <div style={{ background: 'var(--color-paper)', border: '1px solid var(--color-hair)' }}>
      <div
        className="flex items-center justify-between"
        style={{
          padding: 'var(--space-3) var(--space-5)',
          borderBottom: '1px solid var(--color-hair)',
          background: 'var(--color-paper-sunken)',
        }}
      >
        <div className="flex items-center" style={{ gap: 'var(--space-3)' }}>
          <span
            className="font-mono uppercase"
            style={{
              fontSize: 'var(--text-mono-xs)',
              letterSpacing: '0.08em',
              fontWeight: 600,
              color: 'var(--color-ink-muted)',
            }}
          >
            {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
          </span>
          {unreadCount > 0 && (
            <span
              className="font-mono uppercase"
              style={{
                fontSize: 'var(--text-mono-xs)',
                fontWeight: 600,
                letterSpacing: '0.04em',
                padding: '2px 8px',
                border: '1px solid var(--color-accent)',
                color: 'var(--color-accent)',
                borderRadius: 2,
              }}
            >
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllAsRead}
            className="font-mono uppercase flex items-center"
            style={{
              gap: 6,
              fontSize: 'var(--text-mono-sm)',
              fontWeight: 600,
              letterSpacing: '0.04em',
              color: 'var(--color-accent)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
              textDecorationThickness: 1,
              textUnderlineOffset: 3,
              padding: 0,
            }}
          >
            <CheckCheck size={14} strokeWidth={1.5} />
            Mark all read
          </button>
        )}
      </div>

      <div>
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

interface EmptyShellProps {
  icon: typeof Bell
  kicker: string
  title: string
  description: string
  children?: React.ReactNode
}

function EmptyShell({ icon: Icon, kicker, title, description, children }: EmptyShellProps) {
  return (
    <div
      style={{
        padding: 'var(--space-10) var(--space-5)',
        textAlign: 'center',
        background: 'var(--color-paper)',
        border: '1px solid var(--color-hair)',
      }}
    >
      <Icon
        size={24}
        strokeWidth={1.5}
        style={{ color: 'var(--color-ink-soft)', display: 'block', margin: '0 auto var(--space-4)' }}
        aria-hidden="true"
      />
      <div
        className="font-mono uppercase"
        style={{
          fontSize: 'var(--text-mono-xs)',
          letterSpacing: '0.08em',
          color: 'var(--color-accent)',
          fontWeight: 600,
          marginBottom: 'var(--space-2)',
        }}
      >
        {kicker}
      </div>
      <h3
        style={{
          fontFamily: 'var(--font-serif)',
          fontWeight: 600,
          fontSize: 'var(--text-section)',
          color: 'var(--color-ink)',
          margin: 0,
          marginBottom: 'var(--space-3)',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontStyle: 'italic',
          fontSize: 'var(--text-ui-base)',
          color: 'var(--color-ink-muted)',
          margin: 0,
          marginBottom: children ? 'var(--space-5)' : 0,
          maxWidth: '52ch',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        {description}
      </p>
      {children}
    </div>
  )
}
