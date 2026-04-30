import { test, expect } from '@playwright/test'

test.describe('Public reader routes', () => {
  test('/ redirects to the public feed', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/kbw-notes/home', { timeout: 10000 })
    await expect(page.getByRole('heading', { name: 'Notes from the desk.' })).toBeVisible()
  })

  test('/kbw-notes/home renders without sign-in controls', async ({ page }) => {
    await page.goto('/kbw-notes/home')
    await expect(page.getByRole('heading', { name: 'Notes from the desk.' })).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toHaveCount(0)
    await expect(page.getByRole('button', { name: /sign out/i })).toHaveCount(0)
    await expect(page.getByRole('button', { name: /^submissions$/i })).toHaveCount(0)
    await expect(page.getByRole('button', { name: /^notifications$/i })).toHaveCount(0)
    await expect(page.getByRole('button', { name: /^profile$/i })).toHaveCount(0)
  })

  for (const path of [
    '/kbw-notes/profile',
    '/kbw-notes/profile/setup',
    '/kbw-notes/submissions',
    '/kbw-notes/submissions/new',
    '/kbw-notes/submissions/00000000-0000-0000-0000-000000000000',
    '/kbw-notes/notifications',
  ]) {
    test(`${path} is not exposed`, async ({ page }) => {
      await page.goto(path)
      const heading = page.getByRole('heading', { level: 1 })
      await expect(heading).toBeVisible()
      const text = (await heading.textContent())?.toLowerCase() ?? ''
      expect(text).toMatch(/404|not found/)
    })
  }

  test('unknown route renders the 404 page (not a redirect)', async ({ page }) => {
    await page.goto('/this-route-definitely-does-not-exist')
    const heading = page.getByRole('heading', { level: 1 })
    await expect(heading).toBeVisible()
    const text = (await heading.textContent())?.toLowerCase() ?? ''
    expect(text).toMatch(/404|not found/)
  })
})
