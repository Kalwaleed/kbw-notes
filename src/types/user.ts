// User & Authentication Types

export type OAuthProviderId = 'google' | 'apple' | 'microsoft'

export interface LinkedAccount {
  id: string
  provider: OAuthProviderId
  providerEmail: string
  linkedAt: string
}

export interface User {
  id: string
  email: string
  displayName: string
  avatarUrl: string | null
  bio: string
  website: string
  createdAt: string
  profileComplete: boolean
  isContributor: boolean
  linkedAccounts: LinkedAccount[]
}
