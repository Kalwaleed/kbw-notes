import { defineConfig } from '@playwright/test'
import { execFileSync } from 'node:child_process'

// Pull SUPABASE_URL / ANON_KEY / SERVICE_ROLE_KEY from `supabase status -o env`
// so specs don't have to be told the local-stack details. Falls back silently
// if supabase isn't installed; specs themselves fail-fast with a clear error
// if the env still isn't populated.
try {
  const out = execFileSync('supabase', ['status', '-o', 'env'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  })
  for (const line of out.split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)\s*=\s*"?([^"]*)"?$/)
    if (!m) continue
    const [, key, value] = m
    if (process.env[key]) continue
    process.env[key] = value
    if (key === 'API_URL') process.env.SUPABASE_URL ??= value
    if (key === 'ANON_KEY') process.env.SUPABASE_ANON_KEY ??= value
    if (key === 'SERVICE_ROLE_KEY') process.env.SUPABASE_SERVICE_ROLE_KEY ??= value
  }
} catch {
  // Specs validate their own env and surface a useful message if missing.
}

export default defineConfig({
  testDir: './e2e-local',
  fullyParallel: false, // serial: shared test data + ordered scenarios
  workers: 1,
  retries: 0,
  reporter: 'list',
  // No webServer / no baseURL — these specs hit the local Supabase API
  // directly via fetch, no React app needed.
  use: {
    trace: 'retain-on-failure',
  },
})
