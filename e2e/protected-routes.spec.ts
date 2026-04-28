import { test, expect } from '@playwright/test'

// Every /kbw-notes/* route is wrapped in KbwNotesLayout, which uses
// ProtectedRoute to bounce unauthenticated visitors back to "/" with the
// original location preserved in router state. This covers the routing
// surface that adversarial review found stale ("Playwright expects /login
// and OAuth buttons" — neither exists anymore).

const PROTECTED_PATHS = [
  '/kbw-notes',
  '/kbw-notes/home',
  '/kbw-notes/profile',
  '/kbw-notes/profile/setup',
  '/kbw-notes/settings',
  '/kbw-notes/submissions',
  '/kbw-notes/submissions/new',
  '/kbw-notes/submissions/00000000-0000-0000-0000-000000000000',
  '/kbw-notes/notifications',
]

test.describe('Protected routes (unauthenticated)', () => {
  for (const path of PROTECTED_PATHS) {
    test(`${path} redirects to /`, async ({ page }) => {
      await page.goto(path)
      await expect(page).toHaveURL('/', { timeout: 10000 })
      await expect(page.getByRole('heading', { name: 'Welcome to kbw Notes' })).toBeVisible()
    })
  }

  test('unknown route renders the 404 page (not a redirect)', async ({ page }) => {
    await page.goto('/this-route-definitely-does-not-exist')
    // We don't strictly assert URL — react-router keeps it. Just look for the
    // 404 marker. NotFoundPage uses a level-1 heading.
    const heading = page.getByRole('heading', { level: 1 })
    await expect(heading).toBeVisible()
    const text = (await heading.textContent())?.toLowerCase() ?? ''
    expect(text).toMatch(/404|not found/)
  })
})
