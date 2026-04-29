// Settings types for the application

export type Theme = 'light' | 'dark' | 'system'
export type SortOrder = 'newest' | 'oldest' | 'popular'
export type PostsPerPage = 6 | 12 | 24
export type EmailDigest = 'daily' | 'weekly' | 'never'
export type Visibility = 'public' | 'private'

export interface AppearanceSettings {
  theme: Theme
}

export interface ReadingSettings {
  defaultSort: SortOrder
  postsPerPage: PostsPerPage
  autoExpandComments: boolean
}

export interface NotificationSettings {
  emailDigest: EmailDigest
  replyAlerts: boolean
  mentionAlerts: boolean
}

export interface PrivacySettings {
  profileVisibility: Visibility
  bookmarksVisibility: Visibility
}

export interface AccountSettings {
  connectedProvider: string | null
}

export interface AllSettings {
  appearance: AppearanceSettings
  reading: ReadingSettings
  notifications: NotificationSettings
  privacy: PrivacySettings
  account: AccountSettings
}

// Default values
export const defaultAppearanceSettings: AppearanceSettings = {
  theme: 'system',
}

export const defaultReadingSettings: ReadingSettings = {
  defaultSort: 'newest',
  postsPerPage: 12,
  autoExpandComments: false,
}

export const defaultNotificationSettings: NotificationSettings = {
  emailDigest: 'weekly',
  replyAlerts: true,
  mentionAlerts: true,
}

export const defaultPrivacySettings: PrivacySettings = {
  profileVisibility: 'public',
  bookmarksVisibility: 'private',
}

export const defaultAccountSettings: AccountSettings = {
  connectedProvider: null,
}
