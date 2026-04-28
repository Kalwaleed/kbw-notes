import { test, expect } from '@playwright/test'

// These tests hit the live Supabase project directly with the anon key — no
// browser, no auth — to confirm the RLS lockdown is real. They exercise the
// boundary that Codex's adversarial review found broken: clients cannot
// insert moderated comments, cannot manage invites, cannot create or read
// submissions out of band, and cannot peek at the auth_audit log.
//
// Requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (loaded from
// .env.local by playwright.config.ts). If missing, the suite is skipped so
// CI without secrets fails open rather than red.

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY

const restHeaders = (): Record<string, string> => ({
  'Content-Type': 'application/json',
  apikey: ANON_KEY ?? '',
  Authorization: `Bearer ${ANON_KEY ?? ''}`,
  Prefer: 'return=minimal',
})

test.describe('RLS boundary (anon key)', () => {
  test.skip(
    !SUPABASE_URL || !ANON_KEY,
    'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY required (set in .env.local)',
  )

  test('comments INSERT with is_moderated=true is rejected', async ({ request }) => {
    const res = await request.post(`${SUPABASE_URL}/rest/v1/comments`, {
      headers: restHeaders(),
      data: {
        post_id: '00000000-0000-0000-0000-000000000000',
        content: 'rls bypass attempt',
        is_moderated: true,
      },
    })
    expect(res.status()).toBe(401)
    const body = await res.json()
    expect(body.code).toBe('42501')
    expect(body.message).toMatch(/row-level security policy.*comments/i)
  })

  test('invited_emails INSERT is rejected (admin-only)', async ({ request }) => {
    const res = await request.post(`${SUPABASE_URL}/rest/v1/invited_emails`, {
      headers: restHeaders(),
      data: { email: `e2e-attacker-${Date.now()}@kbw.vc` },
    })
    expect(res.status()).toBe(401)
    const body = await res.json()
    expect(body.code).toBe('42501')
  })

  test('invited_emails SELECT returns empty (admin-only read)', async ({ request }) => {
    const res = await request.get(`${SUPABASE_URL}/rest/v1/invited_emails?select=email`, {
      headers: restHeaders(),
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body)).toBe(true)
    expect(body.length).toBe(0)
  })

  test('submissions INSERT is rejected (no auth.uid)', async ({ request }) => {
    const res = await request.post(`${SUPABASE_URL}/rest/v1/submissions`, {
      headers: restHeaders(),
      data: {
        author_id: '00000000-0000-0000-0000-000000000000',
        title: 'rls bypass attempt',
        content: 'should never persist',
      },
    })
    expect(res.status()).toBe(401)
    const body = await res.json()
    expect(body.code).toBe('42501')
  })

  test('auth_audit SELECT returns empty (admin-only read)', async ({ request }) => {
    const res = await request.get(`${SUPABASE_URL}/rest/v1/auth_audit?select=email,event`, {
      headers: restHeaders(),
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body)).toBe(true)
    expect(body.length).toBe(0)
  })

  test('legacy /functions/v1/auto-sign-in returns 410 Gone', async ({ request }) => {
    const res = await request.post(`${SUPABASE_URL}/functions/v1/auto-sign-in`, {
      headers: restHeaders(),
      data: { email: 'k@kbw.vc' },
    })
    expect(res.status()).toBe(410)
    const body = await res.json()
    expect(body.error).toBe('gone')
    expect(body.upgrade).toBe('/functions/v1/request-magic-link')
  })

  test('request-magic-link is publicly invokable and returns 200 for any input', async ({ request }) => {
    // Both bad domain and non-invited @kbw.vc must land on 200 to avoid enumeration.
    for (const email of ['e2e-anon-probe@example.com', `e2e-probe-${Date.now()}@kbw.vc`]) {
      const res = await request.post(`${SUPABASE_URL}/functions/v1/request-magic-link`, {
        headers: restHeaders(),
        data: { email },
      })
      expect(res.status()).toBe(200)
      const body = await res.json()
      expect(body.ok).toBe(true)
    }
  })
})
