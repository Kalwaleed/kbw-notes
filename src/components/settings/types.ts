// Settings types for the application

export type Theme = 'light' | 'dark' | 'system'
export type FontSize = 'small' | 'medium' | 'large'
export type Density = 'compact' | 'comfortable' | 'spacious'
export type SortOrder = 'newest' | 'oldest' | 'popular'
export type PostsPerPage = 6 | 12 | 24
export type EmailDigest = 'daily' | 'weekly' | 'never'
export type Visibility = 'public' | 'private'

export interface AppearanceSettings {
  theme: Theme
  fontSize: FontSize
  density: Density
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
  fontSize: 'medium',
  density: 'comfortable',
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
