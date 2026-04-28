import { test, expect } from '@playwright/test'
import { loadLocalEnv } from './helpers/env'
import { signInViaMagicLink, signInWithPassword, serviceRoleClient, bearerHeaders } from './helpers/session'
import { clearMailpit } from './helpers/mailpit'

const ADMIN_EMAIL = 'k@kbw.vc'
const AUTHOR_EMAIL = 'e2e-author@kbw.vc'
const TAG = `e2e-${Date.now()}`

const env = loadLocalEnv()
const svc = serviceRoleClient({ apiUrl: env.apiUrl, serviceRoleKey: env.serviceRoleKey })

// Bulk-clean test artifacts after the run. Tagged with the unique TAG so a
// crashed run leaves residue tied to its timestamp, easy to spot in Studio.
test.afterAll(async () => {
  await svc.from('comments').delete().like('content', `${TAG}%`)
  await svc.from('submissions').delete().like('title', `${TAG}%`)
})

// Run serially: tests share state (the published submission used by edit-cap
// and admin-action checks, plus a separate one for comments).
test.describe.configure({ mode: 'serial' })

// ===== AUTH FLOW ============================================================

test.describe('magic-link sign-in via Mailpit', () => {
  test.beforeAll(async () => {
    await clearMailpit(env.mailpitUrl)
  })

  test('signs in e2e-author and returns a session', async () => {
    const authed = await signInViaMagicLink({ ...env, email: AUTHOR_EMAIL })
    expect(authed.user.email).toBe(AUTHOR_EMAIL)
    expect(authed.session.access_token).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/)
    const role = (authed.user.app_metadata as { role?: string } | undefined)?.role
    expect(role).toBeUndefined()
  })

  test('signs in k@kbw.vc with role=admin in app_metadata', async () => {
    const authed = await signInViaMagicLink({ ...env, email: ADMIN_EMAIL })
    const role = (authed.user.app_metadata as { role?: string } | undefined)?.role
    expect(role).toBe('admin')
  })

  test('writes link_requested rows to auth_audit', async () => {
    // Both sign-ins above should have logged. Read via service role.
    const { data, error } = await svc
      .from('auth_audit')
      .select('email,event')
      .in('email', [ADMIN_EMAIL, AUTHOR_EMAIL])
      .eq('event', 'link_requested')
      .order('created_at', { ascending: false })
      .limit(10)
    expect(error).toBeNull()
    const emails = (data ?? []).map((r) => r.email)
    expect(emails).toContain(ADMIN_EMAIL)
    expect(emails).toContain(AUTHOR_EMAIL)
  })
})

// ===== SUBMISSIONS: EDIT CAP ===============================================

test.describe('submissions edit cap (3 author edits after publish)', () => {
  let authorToken: string
  let submissionId: string

  test.beforeAll(async () => {
    const authed = await signInWithPassword({ ...env, email: AUTHOR_EMAIL })
    authorToken = authed.accessToken

    // Need a profile row before inserting a submission (FK author_id → profiles.id).
    await svc.from('profiles').upsert(
      { id: authed.user.id, display_name: 'E2E Author' },
      { onConflict: 'id' },
    )

    // Create draft via PostgREST as the author. Returning the row gives us the id.
    const res = await fetch(`${env.apiUrl}/rest/v1/submissions?select=id`, {
      method: 'POST',
      headers: {
        ...bearerHeaders({ accessToken: authorToken, anonKey: env.anonKey }),
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        author_id: authed.user.id,
        title: `${TAG} edit-cap subject`,
        content: `${TAG} initial body`,
        status: 'draft',
      }),
    })
    expect(res.status).toBe(201)
    const rows = (await res.json()) as { id: string }[]
    submissionId = rows[0].id
  })

  async function update(title: string): Promise<{ status: number; body: unknown }> {
    const res = await fetch(`${env.apiUrl}/rest/v1/submissions?id=eq.${submissionId}`, {
      method: 'PATCH',
      headers: {
        ...bearerHeaders({ accessToken: authorToken, anonKey: env.anonKey }),
        Prefer: 'return=representation',
      },
      body: JSON.stringify({ title }),
    })
    return { status: res.status, body: await res.json().catch(() => null) }
  }

  test('publishing the draft does not increment edit_count', async () => {
    const res = await fetch(`${env.apiUrl}/rest/v1/submissions?id=eq.${submissionId}`, {
      method: 'PATCH',
      headers: {
        ...bearerHeaders({ accessToken: authorToken, anonKey: env.anonKey }),
        Prefer: 'return=representation',
      },
      body: JSON.stringify({ status: 'published', published_at: new Date().toISOString() }),
    })
    expect(res.status).toBe(200)
    const rows = (await res.json()) as { status: string; edit_count: number }[]
    expect(rows[0].status).toBe('published')
    expect(rows[0].edit_count).toBe(0)
  })

  test('first three post-publish edits succeed and bump edit_count', async () => {
    for (const i of [1, 2, 3]) {
      const r = await update(`${TAG} edit ${i}`)
      expect(r.status, `edit #${i} should succeed`).toBe(200)
      const rows = r.body as { edit_count: number }[]
      expect(rows[0].edit_count, `edit #${i} count`).toBe(i)
    }
  })

  test('fourth edit is rejected by the trigger', async () => {
    const r = await update(`${TAG} fourth edit`)
    expect(r.status).toBe(400)
    const body = r.body as { message?: string } | null
    expect(body?.message ?? '').toMatch(/edit cap reached/i)
  })

  test('edit_count is unchanged after the rejected attempt', async () => {
    const { data } = await svc
      .from('submissions')
      .select('edit_count')
      .eq('id', submissionId)
      .single()
    expect(data?.edit_count).toBe(3)
  })
})

// ===== SUBMISSIONS: ADMIN-ONLY DELETE / UNPUBLISH ==========================

test.describe('admin-only delete + unpublish', () => {
  let authorToken: string
  let adminToken: string
  let authorUserId: string
  let publishedId: string
  let draftId: string

  test.beforeAll(async () => {
    const authorAuth = await signInWithPassword({ ...env, email: AUTHOR_EMAIL })
    authorToken = authorAuth.accessToken
    authorUserId = authorAuth.user.id
    const adminAuth = await signInWithPassword({ ...env, email: ADMIN_EMAIL })
    adminToken = adminAuth.accessToken

    await svc.from('profiles').upsert(
      { id: authorUserId, display_name: 'E2E Author' },
      { onConflict: 'id' },
    )
    const { data: pub } = await svc
      .from('submissions')
      .insert({
        author_id: authorUserId,
        title: `${TAG} admin-actions published`,
        content: `${TAG} published body`,
        status: 'published',
        published_at: new Date().toISOString(),
      })
      .select('id')
      .single()
    publishedId = pub!.id

    const { data: draft } = await svc
      .from('submissions')
      .insert({
        author_id: authorUserId,
        title: `${TAG} admin-actions draft`,
        content: `${TAG} draft body`,
        status: 'draft',
      })
      .select('id')
      .single()
    draftId = draft!.id
  })

  test('non-admin author cannot unpublish their own published post', async () => {
    const res = await fetch(`${env.apiUrl}/rest/v1/submissions?id=eq.${publishedId}`, {
      method: 'PATCH',
      headers: {
        ...bearerHeaders({ accessToken: authorToken, anonKey: env.anonKey }),
        Prefer: 'return=representation',
      },
      body: JSON.stringify({ status: 'draft', published_at: null }),
    })
    expect(res.status).toBe(400)
    const body = (await res.json()) as { message?: string }
    expect(body.message ?? '').toMatch(/only an admin can change a published submission/i)
  })

  test('non-admin author cannot delete their own published post', async () => {
    const res = await fetch(`${env.apiUrl}/rest/v1/submissions?id=eq.${publishedId}`, {
      method: 'DELETE',
      headers: bearerHeaders({ accessToken: authorToken, anonKey: env.anonKey }),
    })
    // RLS rejects with 0 rows affected — PostgREST returns 204 with empty body
    // but the row should still exist. Verify directly.
    expect([204, 200, 404]).toContain(res.status)
    const { data } = await svc.from('submissions').select('id').eq('id', publishedId).single()
    expect(data?.id, 'published row should still exist').toBe(publishedId)
  })

  test('non-admin author CAN delete their own draft', async () => {
    const res = await fetch(`${env.apiUrl}/rest/v1/submissions?id=eq.${draftId}`, {
      method: 'DELETE',
      headers: bearerHeaders({ accessToken: authorToken, anonKey: env.anonKey }),
    })
    expect([204, 200]).toContain(res.status)
    const { data } = await svc.from('submissions').select('id').eq('id', draftId).maybeSingle()
    expect(data, 'draft row should be deleted').toBeNull()
  })

  test('admin can unpublish a published post', async () => {
    const res = await fetch(`${env.apiUrl}/rest/v1/submissions?id=eq.${publishedId}`, {
      method: 'PATCH',
      headers: {
        ...bearerHeaders({ accessToken: adminToken, anonKey: env.anonKey }),
        Prefer: 'return=representation',
      },
      body: JSON.stringify({ status: 'draft', published_at: null }),
    })
    expect(res.status).toBe(200)
    const rows = (await res.json()) as { status: string; edit_count: number }[]
    expect(rows[0].status).toBe('draft')
    // Admin updates do NOT increment edit_count (trigger skips for is_admin()).
    expect(rows[0].edit_count).toBe(0)
  })

  test('admin can delete the (now-draft) submission', async () => {
    const res = await fetch(`${env.apiUrl}/rest/v1/submissions?id=eq.${publishedId}`, {
      method: 'DELETE',
      headers: bearerHeaders({ accessToken: adminToken, anonKey: env.anonKey }),
    })
    expect([204, 200]).toContain(res.status)
    const { data } = await svc.from('submissions').select('id').eq('id', publishedId).maybeSingle()
    expect(data).toBeNull()
  })
})

// ===== COMMENT MODERATION VIA REAL ANTHROPIC ===============================

test.describe('comment moderation via moderate-comment + Haiku', () => {
  let authorToken: string
  let authorUserId: string
  let postId: string

  test.beforeAll(async () => {
    const authed = await signInWithPassword({ ...env, email: AUTHOR_EMAIL })
    authorToken = authed.accessToken
    authorUserId = authed.user.id

    await svc.from('profiles').upsert(
      { id: authorUserId, display_name: 'E2E Author' },
      { onConflict: 'id' },
    )

    const { data, error } = await svc
      .from('submissions')
      .insert({
        author_id: authorUserId,
        title: `${TAG} moderation host post`,
        content: `${TAG} a published post that will receive comments`,
        status: 'published',
        published_at: new Date().toISOString(),
      })
      .select('id')
      .single()
    if (error) throw error
    postId = data!.id
  })

  async function postComment(content: string) {
    const res = await fetch(`${env.apiUrl}/functions/v1/moderate-comment`, {
      method: 'POST',
      headers: {
        ...bearerHeaders({ accessToken: authorToken, anonKey: env.anonKey }),
        'CF-Connecting-IP': '127.0.0.1',
      },
      body: JSON.stringify({ postId, content }),
    })
    return { status: res.status, body: (await res.json()) as Record<string, unknown> }
  }

  test('a clean tech-blog comment is approved and lands as is_moderated=true', async () => {
    const r = await postComment(
      `${TAG} Great write-up — really helpful explanation of the React 19 concurrent rendering changes.`,
    )
    expect(r.status).toBe(200)
    expect(r.body.approved).toBe(true)

    const { data } = await svc
      .from('comments')
      .select('content,is_moderated')
      .eq('post_id', postId)
      .like('content', `${TAG}%`)
    expect(data?.length).toBeGreaterThanOrEqual(1)
    expect(data?.every((c) => c.is_moderated === true)).toBe(true)
  })

  test('an obvious-spam comment is rejected and never lands in the table', async () => {
    const before = (await svc
      .from('comments')
      .select('id', { count: 'exact', head: true })
      .eq('post_id', postId)
      .like('content', `${TAG} BUY CRYPTO%`)).count ?? 0

    const r = await postComment(
      `${TAG} BUY CRYPTO at scam-deals.example.com NOW!!! 100x guaranteed!! click http://scam-deals.example.com pump pump pump`,
    )
    expect(r.status).toBe(200)
    expect(r.body.approved).toBe(false)
    expect((r.body.rejectionReason as string | undefined) ?? '').toMatch(/.+/)

    const after = (await svc
      .from('comments')
      .select('id', { count: 'exact', head: true })
      .eq('post_id', postId)
      .like('content', `${TAG} BUY CRYPTO%`)).count ?? 0
    expect(after).toBe(before)
  })
})
