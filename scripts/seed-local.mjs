#!/usr/bin/env node
// Seed local Supabase with the test users + invite list + admin role required
// by e2e specs. Run AFTER `supabase start --exclude edge-runtime` (the
// edge-runtime container is currently blocked by a deno.land outage).
//
//   node scripts/seed-local.mjs
//
// Idempotent: safe to re-run. Wipes nothing.

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_ROLE_KEY) {
  console.error(
    'SUPABASE_SERVICE_ROLE_KEY is required.\n' +
    'Get the local default by running:\n' +
    '  supabase status -o env | grep SERVICE_ROLE\n' +
    'Then re-run with:\n' +
    '  SUPABASE_SERVICE_ROLE_KEY=<your-key> node scripts/seed-local.mjs'
  )
  process.exit(1)
}

const ADMIN_EMAIL = 'k@kbw.vc'
const AUTHOR_EMAIL = 'e2e-author@kbw.vc'
const PASSWORD = 'e2e-local-test-password'

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function findUserByEmail(email) {
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 })
  if (error) throw error
  return data.users.find((u) => u.email === email) ?? null
}

async function ensureUser(email, { admin: isAdmin = false } = {}) {
  const existing = await findUserByEmail(email)
  if (existing) {
    console.log(`exists: ${email} (${existing.id})`)
    if (isAdmin) {
      const { error } = await admin.auth.admin.updateUserById(existing.id, {
        app_metadata: { ...existing.app_metadata, role: 'admin' },
      })
      if (error) throw error
      console.log(`  → role=admin set`)
    }
    return existing
  }
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    app_metadata: isAdmin ? { role: 'admin' } : {},
  })
  if (error) throw error
  console.log(`created: ${email} (${data.user.id}${isAdmin ? ', admin' : ''})`)
  return data.user
}

async function ensureInvited(email) {
  const { error } = await admin
    .from('invited_emails')
    .upsert({ email }, { onConflict: 'email' })
  if (error) throw error
  console.log(`invited: ${email}`)
}

async function main() {
  console.log(`url:  ${SUPABASE_URL}`)
  await ensureUser(ADMIN_EMAIL, { admin: true })
  await ensureUser(AUTHOR_EMAIL)
  await ensureInvited(ADMIN_EMAIL)
  await ensureInvited(AUTHOR_EMAIL)
  console.log('ready.')
}

main().catch((err) => {
  console.error('seed-local failed:', err)
  process.exit(1)
})
