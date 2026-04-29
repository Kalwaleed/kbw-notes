import { test, expect } from '@playwright/test'

test.use({ channel: 'chrome' })

test.describe('reported functionality', () => {
  test('mobile hamburger opens the navigation drawer', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/kbw-notes/notifications')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: 'Notifications.' })).toBeVisible()
    await page.getByRole('button', { name: /open menu/i }).click()

    await expect(page.getByRole('button', { name: 'Home' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Submissions' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Notifications', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Settings' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Profile' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible()
  })

  test('desktop header does not show the mobile hamburger', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/kbw-notes/notifications')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('button', { name: /open menu/i })).not.toBeVisible()
  })

  test('notifications page renders liked-post and commented-post rows', async ({ page }) => {
    await page.goto('/kbw-notes/notifications')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('2 notifications')).toBeVisible()
    await expect(page.getByText('2 new')).toBeVisible()
    await expect(page.getByText('Alex Morgan liked "Operating Notes"')).toBeVisible()
    await expect(page.getByText('Rana Said commented on "Operating Notes"')).toBeVisible()
  })

  test('creates and publishes a local article with a cover image', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => window.localStorage.removeItem('kbw_local_dev_submissions'))

    await page.goto('/kbw-notes/submissions/new')
    await expect(page.getByRole('heading', { name: 'Edit draft.' })).toBeVisible()

    await page.locator('input[type="file"]').first().setInputFiles({
      name: 'local-cover.png',
      mimeType: 'image/png',
      buffer: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8z8BQDwAFgwJ/lV9V+QAAAABJRU5ErkJggg==',
        'base64'
      ),
    })

    await expect(page.getByAltText('Cover')).toBeVisible()

    const title = 'Local Test: Platform Notes'
    const excerpt = 'A local-only test article for validating the submission workflow.'
    const body = [
      'This article was created through the local development UI.',
      'It verifies cover upload, title entry, rich-text body editing, preview, save, and publish behavior.',
    ].join('\n\n')

    await page.getByLabel('Title').fill(title)
    await page.getByLabel(/Excerpt/).fill(excerpt)
    await page.locator('.tiptap').click()
    await page.keyboard.insertText(body)

    await page.getByRole('button', { name: /save/i }).click()
    await expect(page.getByText('Saved')).toBeVisible()

    await page.getByRole('button', { name: /preview/i }).click()
    await expect(page.getByRole('heading', { name: title })).toBeVisible()
    await expect(page.getByText(excerpt)).toBeVisible()
    await expect(page.getByText('This article was created through the local development UI.')).toBeVisible()

    await page.getByRole('button', { name: /publish/i }).click()
    await expect(page.getByText(/published/i).first()).toBeVisible()

    await page.goto('/kbw-notes/submissions')
    await expect(page.getByRole('heading', { name: 'Submissions', exact: true })).toBeVisible()
    await expect(page.getByText(title)).toBeVisible()
    await expect(page.getByText(excerpt)).toBeVisible()
  })
})
