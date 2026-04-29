import type { Session, User } from '@supabase/supabase-js'
import type { Notification } from '../types/notification'
import { PUBLISHED_EDIT_CAP, type Submission, type SubmissionFormData, type SubmissionStatus } from '../types/submission'
import type { Profile } from './database.types'

export const isLocalAuthBypassEnabled =
  import.meta.env.DEV && import.meta.env.VITE_LOCAL_AUTH_BYPASS === 'true'

export const localDevUser: User = {
  id: '11111111-1111-4111-8111-111111111111',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'local@kbw.vc',
  app_metadata: { role: 'admin', provider: 'local-dev', providers: ['local-dev'] },
  user_metadata: {
    full_name: 'Local Developer',
    name: 'Local Developer',
    avatar_url: null,
  },
  identities: [],
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
}

export const localDevSession: Session = {
  access_token: 'local-dev-access-token',
  refresh_token: 'local-dev-refresh-token',
  token_type: 'bearer',
  expires_in: 31_536_000,
  expires_at: Math.floor(Date.now() / 1000) + 31_536_000,
  user: localDevUser,
}

export const localDevProfile: Profile = {
  id: localDevUser.id,
  display_name: 'Local Developer',
  avatar_url: null,
  bio: 'Local development profile',
  website: null,
  created_at: localDevUser.created_at,
  updated_at: localDevUser.updated_at ?? localDevUser.created_at,
}

export const localDevNotifications: Notification[] = [
  {
    id: '22222222-2222-4222-8222-222222222222',
    userId: localDevUser.id,
    type: 'submission_like',
    title: 'Your post was liked',
    message: 'Alex Morgan liked "Operating Notes"',
    isRead: false,
    relatedEntityType: 'submission',
    relatedEntityId: '33333333-3333-4333-8333-333333333333',
    actionUrl: '/kbw-notes/post/33333333-3333-4333-8333-333333333333',
    actor: {
      id: '44444444-4444-4444-8444-444444444444',
      displayName: 'Alex Morgan',
      avatarUrl: null,
    },
    createdAt: new Date(Date.now() - 5 * 60_000).toISOString(),
  },
  {
    id: '55555555-5555-4555-8555-555555555555',
    userId: localDevUser.id,
    type: 'submission_comment',
    title: 'New comment on your post',
    message: 'Rana Said commented on "Operating Notes"',
    isRead: false,
    relatedEntityType: 'submission',
    relatedEntityId: '33333333-3333-4333-8333-333333333333',
    actionUrl: '/kbw-notes/post/33333333-3333-4333-8333-333333333333',
    actor: {
      id: '66666666-6666-4666-8666-666666666666',
      displayName: 'Rana Said',
      avatarUrl: null,
    },
    createdAt: new Date(Date.now() - 12 * 60_000).toISOString(),
  },
]

const localDevSubmissionsKey = 'kbw_local_dev_submissions'

function readLocalDevSubmissions(): Submission[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = window.localStorage.getItem(localDevSubmissionsKey)
    if (!stored) return []
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeLocalDevSubmissions(submissions: Submission[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(localDevSubmissionsKey, JSON.stringify(submissions))
}

function makeSlug(title: string): string | null {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || null
}

export function fetchLocalDevSubmissions({
  authorId,
  status = 'all',
}: {
  authorId: string
  status?: SubmissionStatus | 'all'
}): Submission[] {
  return readLocalDevSubmissions()
    .filter((submission) => submission.authorId === authorId)
    .filter((submission) => status === 'all' || submission.status === status)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
}

export function fetchLocalDevSubmission(id: string): Submission | null {
  return readLocalDevSubmissions().find((submission) => submission.id === id) ?? null
}

export function createLocalDevSubmission(authorId: string): Submission {
  const now = new Date().toISOString()
  const submission: Submission = {
    id: crypto.randomUUID(),
    authorId,
    title: '',
    slug: null,
    excerpt: '',
    content: '',
    coverImageUrl: null,
    tags: [],
    status: 'draft',
    publishedAt: null,
    createdAt: now,
    updatedAt: now,
    editCount: 0,
    editsRemaining: PUBLISHED_EDIT_CAP,
  }

  writeLocalDevSubmissions([submission, ...readLocalDevSubmissions()])
  return submission
}

export function updateLocalDevSubmission(id: string, data: Partial<SubmissionFormData>): Submission {
  const submissions = readLocalDevSubmissions()
  const index = submissions.findIndex((submission) => submission.id === id)

  if (index === -1) {
    throw new Error('Local development submission not found')
  }

  const current = submissions[index]
  const updated: Submission = {
    ...current,
    title: data.title ?? current.title,
    slug: data.title !== undefined ? makeSlug(data.title) : current.slug,
    excerpt: data.excerpt ?? current.excerpt,
    content: data.content ?? current.content,
    coverImageUrl: data.coverImageUrl !== undefined ? data.coverImageUrl : current.coverImageUrl,
    tags: data.tags ?? current.tags,
    updatedAt: new Date().toISOString(),
  }

  submissions[index] = updated
  writeLocalDevSubmissions(submissions)
  return updated
}

export function publishLocalDevSubmission(id: string): Submission {
  const submissions = readLocalDevSubmissions()
  const index = submissions.findIndex((submission) => submission.id === id)

  if (index === -1) {
    throw new Error('Local development submission not found')
  }

  const now = new Date().toISOString()
  const updated: Submission = {
    ...submissions[index],
    status: 'published',
    publishedAt: now,
    updatedAt: now,
  }

  submissions[index] = updated
  writeLocalDevSubmissions(submissions)
  return updated
}

export function unpublishLocalDevSubmission(id: string): Submission {
  const submissions = readLocalDevSubmissions()
  const index = submissions.findIndex((submission) => submission.id === id)

  if (index === -1) {
    throw new Error('Local development submission not found')
  }

  const updated: Submission = {
    ...submissions[index],
    status: 'draft',
    publishedAt: null,
    updatedAt: new Date().toISOString(),
  }

  submissions[index] = updated
  writeLocalDevSubmissions(submissions)
  return updated
}

export function deleteLocalDevSubmission(id: string): void {
  writeLocalDevSubmissions(readLocalDevSubmissions().filter((submission) => submission.id !== id))
}
