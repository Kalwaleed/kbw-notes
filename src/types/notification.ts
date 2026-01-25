// Notification Types

export type NotificationType =
  | 'comment_reply'
  | 'submission_comment'
  | 'submission_like'
  | 'mention'

export interface NotificationActor {
  id: string
  displayName: string
  avatarUrl: string | null
}

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  relatedEntityType: string | null
  relatedEntityId: string | null
  actionUrl: string | null
  actor: NotificationActor | null
  createdAt: string
}

export interface NotificationCounts {
  total: number
  unread: number
}
