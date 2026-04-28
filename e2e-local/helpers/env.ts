// Local-stack URL + key helpers for e2e specs.
// Reads from process.env (loaded by playwright.config.local.ts) and surfaces
// a single typed accessor + a fail-fast validator.

export type LocalEnv = {
  apiUrl: string
  mailpitUrl: string
  anonKey: string
  serviceRoleKey: string
}

export function loadLocalEnv(): LocalEnv {
  const apiUrl = process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321'
  const mailpitUrl = process.env.MAILPIT_URL ?? 'http://127.0.0.1:54324'
  const anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.ANON_KEY ?? ''
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SERVICE_ROLE_KEY ?? ''

  if (!anonKey) {
    throw new Error(
      'SUPABASE_ANON_KEY missing. Run `eval "$(supabase status -o env)"` before `npm run test:e2e:local`.',
    )
  }
  if (!serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY missing. Run `eval "$(supabase status -o env)"` before `npm run test:e2e:local`.',
    )
  }
  return { apiUrl, mailpitUrl, anonKey, serviceRoleKey }
}
