import { defineConfig, devices } from '@playwright/test'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

// Minimal .env.local loader so e2e specs can read VITE_SUPABASE_URL /
// VITE_SUPABASE_ANON_KEY without adding a dotenv dependency. Specs that
// need these keys gate themselves with `test.skip` if they're missing, so
// CI without secrets degrades gracefully.
const envPath = resolve(process.cwd(), '.env.local')
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
    if (!m) continue
    const [, key, rawValue] = m
    if (process.env[key]) continue
    process.env[key] = rawValue.replace(/^['"]|['"]$/g, '')
  }
}

// Optional: target a Vercel-protected deployment instead of the local dev
// server. Set PLAYWRIGHT_BASE_URL=https://kalwaleed.com (or a preview URL)
// and VERCEL_BYPASS_SECRET=<value> to send the protection-bypass header on
// every request. The secret value is read only from the environment — never
// hardcode it here, never log it, never include it in test fixtures or
// commit messages. .env.local (gitignored) is the recommended store.
//
// Trace/HAR caveat: Playwright's built-in trace recorder captures request
// headers. The `trace: 'on-first-retry'` setting below means traces are
// only generated for failing tests, and the test-results/ and
// playwright-report/ directories are gitignored. If you upload traces to
// CI artifacts on a public repo, they will contain the bypass header —
// either rotate the secret after such runs or disable trace upload.
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173'
const isProtectedTarget = !/^https?:\/\/(localhost|127\.0\.0\.1)/.test(baseURL)
const bypassSecret = process.env.VERCEL_BYPASS_SECRET

if (isProtectedTarget && !bypassSecret) {
  throw new Error(
    'PLAYWRIGHT_BASE_URL targets a Vercel-protected URL but VERCEL_BYPASS_SECRET is not set. ' +
      'Add it to .env.local or your CI secret store.'
  )
}

const extraHTTPHeaders =
  isProtectedTarget && bypassSecret
    ? {
        'x-vercel-protection-bypass': bypassSecret,
        'x-vercel-set-bypass-cookie': 'true',
      }
    : undefined

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL,
    extraHTTPHeaders,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  // Only spin up the local dev server when targeting localhost. Targeting a
  // remote URL bypasses webServer entirely.
  webServer: isProtectedTarget
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://localhost:5173',
        reuseExistingServer: !process.env.CI,
      },
})
