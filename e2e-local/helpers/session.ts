// Sign-in helper for the local stack: drives the full magic-link flow end
// to end (request-magic-link edge function → Mailpit → verifyOtp) and
// returns the resulting Supabase client + session.
//
// Sessions are cached per email so that calling signInViaMagicLink twice for
// the same user reuses the original session. This avoids:
//   * GoTrue's per-email magic-link rate limit (1 per 60s by default)
//   * single-use token consumption tripping a second-call replay attempt
// Tokens are valid for an hour by default, well past any test-suite runtime.

import { createClient, type Session, type SupabaseClient, type User } from '@supabase/supabase-js'
import { extractMagicLink, snapshotMessageIds, waitForNewMessage } from './mailpit'

export type AuthedClient = {
  client: SupabaseClient
  user: User
  session: Session
  accessToken: string
}

type SignInArgs = {
  apiUrl: string
  anonKey: string
  mailpitUrl: string
  email: string
}

const sessionCache = new Map<string, AuthedClient>()

export async function signInViaMagicLink(args: SignInArgs): Promise<AuthedClient> {
  const cacheKey = args.email.toLowerCase()
  const cached = sessionCache.get(cacheKey)
  if (cached) return cached

  // Snapshot existing messages first so we can detect the new one by ID.
  const before = await snapshotMessageIds(args.mailpitUrl, args.email)

  const reqRes = await fetch(`${args.apiUrl}/functions/v1/request-magic-link`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: args.anonKey,
      Authorization: `Bearer ${args.anonKey}`,
      'CF-Connecting-IP': '127.0.0.1',
    },
    body: JSON.stringify({ email: args.email }),
  })
  if (!reqRes.ok) {
    throw new Error(`request-magic-link returned ${reqRes.status}: ${await reqRes.text()}`)
  }

  const message = await waitForNewMessage(args.mailpitUrl, args.email, before)
  const { tokenHash } = extractMagicLink(message)

  const client = createClient(args.apiUrl, args.anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const { data, error } = await client.auth.verifyOtp({
    type: 'email',
    token_hash: tokenHash,
  })
  if (error || !data.session || !data.user) {
    throw new Error(`verifyOtp failed: ${error?.message ?? 'no session'}`)
  }

  const authed: AuthedClient = {
    client,
    user: data.user,
    session: data.session,
    accessToken: data.session.access_token,
  }
  sessionCache.set(cacheKey, authed)
  return authed
}

export function clearSessionCache(): void {
  sessionCache.clear()
}

// Fast sign-in for tests that don't care about exercising the magic-link
// flow itself. Both seeded users (k@kbw.vc, e2e-author@kbw.vc) have a known
// password set in scripts/seed-local.mjs. Avoids GoTrue's per-email
// magic-link rate limit and Mailpit polling — useful for setup hooks.
const TEST_USER_PASSWORD = 'e2e-local-test-password'

export async function signInWithPassword(args: {
  apiUrl: string
  anonKey: string
  email: string
}): Promise<AuthedClient> {
  const cacheKey = `pwd:${args.email.toLowerCase()}`
  const cached = sessionCache.get(cacheKey)
  if (cached) return cached

  const client = createClient(args.apiUrl, args.anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const { data, error } = await client.auth.signInWithPassword({
    email: args.email,
    password: TEST_USER_PASSWORD,
  })
  if (error || !data.session || !data.user) {
    throw new Error(`signInWithPassword failed for ${args.email}: ${error?.message ?? 'no session'}`)
  }
  const authed: AuthedClient = {
    client,
    user: data.user,
    session: data.session,
    accessToken: data.session.access_token,
  }
  sessionCache.set(cacheKey, authed)
  return authed
}

export function serviceRoleClient(args: { apiUrl: string; serviceRoleKey: string }): SupabaseClient {
  return createClient(args.apiUrl, args.serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export function bearerHeaders(args: { accessToken: string; anonKey: string }): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    apikey: args.anonKey,
    Authorization: `Bearer ${args.accessToken}`,
  }
}
