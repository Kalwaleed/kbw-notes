import { test, expect } from '@playwright/test'

// All public, unauthenticated UX lives at "/" (the LoginPage).
// The blog feed itself is behind auth at /kbw-notes/home and is covered by
// protected-routes.spec.ts.

test.describe('Login page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('renders the heading and the prompt', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Welcome to kbw Notes' })).toBeVisible()
    await expect(page.getByText(/@kbw\.vc email to receive a magic link/i)).toBeVisible()
  })

  test('keeps the submit button disabled until a domain-matching email is typed', async ({ page }) => {
    const submit = page.getByRole('button', { name: /send sign-in link/i })
    await expect(submit).toBeDisabled()

    const input = page.getByLabel(/email address/i)
    await input.fill('foo@gmail.com')
    await expect(page.getByText(/Only @kbw\.vc emails are allowed/i)).toBeVisible()
    await expect(submit).toBeDisabled()

    await input.fill('someone@kbw.vc')
    await expect(page.getByText(/Only @kbw\.vc emails are allowed/i)).not.toBeVisible()
    await expect(submit).toBeEnabled()
  })

  test('rejects non @kbw.vc submission with an explicit error', async ({ page }) => {
    const input = page.getByLabel(/email address/i)
    // Bypass the disabled state by submitting via Enter on the form.
    await input.fill('intruder@evil.test')
    await input.press('Enter')
    await expect(page.getByText(/Only @kbw\.vc emails are allowed/i)).toBeVisible()
  })

  test('submitting an @kbw.vc address shows the Check your inbox state', async ({ page }) => {
    // Even non-invited @kbw.vc addresses MUST hit the Check-your-inbox state —
    // the edge function returns 200 either way to prevent enumeration.
    // Use a never-invited but well-formed address so we don't burn a real link.
    const probe = `e2e-noop-${Date.now()}@kbw.vc`
    await page.getByLabel(/email address/i).fill(probe)
    await page.getByRole('button', { name: /send sign-in link/i }).click()

    await expect(page.getByRole('heading', { name: /check your inbox/i }).or(
      page.getByText(/Check your inbox for a sign-in link/i)
    )).toBeVisible({ timeout: 15000 })
    await expect(page.getByText(probe)).toBeVisible()
    await expect(page.getByRole('button', { name: /use a different email/i })).toBeVisible()
  })

  test('use a different email returns to the form', async ({ page }) => {
    await page.getByLabel(/email address/i).fill(`e2e-noop-${Date.now()}@kbw.vc`)
    await page.getByRole('button', { name: /send sign-in link/i }).click()
    await page.getByRole('button', { name: /use a different email/i }).click()
    await expect(page.getByLabel(/email address/i)).toBeVisible()
    await expect(page.getByLabel(/email address/i)).toHaveValue('')
  })

  test('theme toggle flips the label between light and dark', async ({ page }) => {
    const themeButton = page.getByRole('button', { name: /switch to (light|dark) mode/i })
    await expect(themeButton).toBeVisible()
    const before = (await themeButton.textContent())?.trim()
    await themeButton.click()
    const after = (await themeButton.textContent())?.trim()
    expect(after).not.toBe(before)
  })

  for (const viewport of [
    { label: 'mobile',  width: 375,  height: 667 },
    { label: 'tablet',  width: 768,  height: 1024 },
    { label: 'desktop', width: 1440, height: 900 },
  ]) {
    test(`renders cleanly at ${viewport.label} (${viewport.width}x${viewport.height})`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto('/')
      await expect(page.getByRole('heading', { name: 'Welcome to kbw Notes' })).toBeVisible()
      await expect(page.getByLabel(/email address/i)).toBeVisible()
    })
  }
})
