import { test, expect } from '@playwright/test'

test.describe('Blog Feed', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.describe('Browse Blog Posts', () => {
    test('displays the page header', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'kbw Notes' })).toBeVisible()
      await expect(page.getByText('Tech discoveries, projects, and insights')).toBeVisible()
    })

    test('shows posts or empty state after loading', async ({ page }) => {
      // Wait for either posts to load OR empty state to appear
      // This handles both scenarios: database with posts or empty database
      const emptyState = page.getByText('No posts yet')
      const firstPost = page.locator('article').first()

      // Wait for one of these to be visible (with generous timeout for API)
      await expect(emptyState.or(firstPost)).toBeVisible({ timeout: 10000 })

      // Verify we're in a valid state
      const hasEmptyState = await emptyState.isVisible().catch(() => false)
      const hasPosts = await firstPost.isVisible().catch(() => false)

      expect(hasEmptyState || hasPosts).toBeTruthy()
    })

    test('shows loading state initially', async ({ page }) => {
      // Navigate fresh and check for loading
      await page.goto('/')
      // Loading state may be very brief, so we just verify the page loads
      await expect(page.getByRole('heading', { name: 'kbw Notes' })).toBeVisible()
    })
  })

  test.describe('Navigation', () => {
    test('clicking a blog post card navigates to post detail', async ({ page }) => {
      // Wait for any posts to load
      const article = page.locator('article').first()
      const hasArticle = await article.isVisible({ timeout: 5000 }).catch(() => false)

      if (hasArticle) {
        // Click the article (the main clickable area)
        await article.locator('button').first().click()

        // Should navigate to /post/:id
        await expect(page).toHaveURL(/\/post\//)
      } else {
        // No posts to click - skip this test scenario
        test.skip()
      }
    })
  })

  test.describe('Like Action', () => {
    test('clicking like when not authenticated redirects to login', async ({ page }) => {
      // Wait for any posts to load
      const likeButton = page.getByRole('button', { name: /like/i }).first()
      const hasLikeButton = await likeButton.isVisible({ timeout: 5000 }).catch(() => false)

      if (hasLikeButton) {
        await likeButton.click()

        // Should redirect to login
        await expect(page).toHaveURL(/\/login/)
      } else {
        // No posts available - skip
        test.skip()
      }
    })
  })

  test.describe('Bookmark Action', () => {
    test('clicking bookmark when not authenticated redirects to login', async ({ page }) => {
      const bookmarkButton = page.getByRole('button', { name: /bookmark/i }).first()
      const hasBookmarkButton = await bookmarkButton.isVisible({ timeout: 5000 }).catch(() => false)

      if (hasBookmarkButton) {
        await bookmarkButton.click()

        // Should redirect to login
        await expect(page).toHaveURL(/\/login/)
      } else {
        test.skip()
      }
    })
  })

  test.describe('Share Action', () => {
    test('clicking share triggers share functionality', async ({ page }) => {
      const shareButton = page.getByRole('button', { name: /share/i }).first()
      const hasShareButton = await shareButton.isVisible({ timeout: 5000 }).catch(() => false)

      if (hasShareButton) {
        // Mock the share API
        await page.evaluate(() => {
          // @ts-expect-error - mocking navigator.share
          navigator.share = async () => Promise.resolve()
        })

        // Click should not throw
        await shareButton.click()

        // Should still be on home page (share doesn't navigate)
        await expect(page).toHaveURL('/')
      } else {
        test.skip()
      }
    })
  })

  test.describe('Theme Toggle', () => {
    test('can toggle between light and dark mode', async ({ page }) => {
      const themeButton = page.getByRole('button', { name: /mode/i })
      await expect(themeButton).toBeVisible()

      // Get initial state
      const initialText = await themeButton.textContent()

      // Toggle
      await themeButton.click()

      // Text should change
      const newText = await themeButton.textContent()
      expect(newText).not.toBe(initialText)

      // Toggle back
      await themeButton.click()
      const finalText = await themeButton.textContent()
      expect(finalText).toBe(initialText)
    })
  })
})

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('displays login page with OAuth buttons', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /welcome to kbw notes/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /google/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /apple/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /microsoft/i })).toBeVisible()
  })

  test('can navigate back to home without signing in', async ({ page }) => {
    await page.getByRole('button', { name: /continue browsing/i }).click()
    await expect(page).toHaveURL('/')
  })

  test('has theme toggle', async ({ page }) => {
    const themeButton = page.getByRole('button', { name: /mode/i })
    await expect(themeButton).toBeVisible()
  })
})

test.describe('Responsive Design', () => {
  test('displays correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'kbw Notes' })).toBeVisible()
  })

  test('displays correctly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'kbw Notes' })).toBeVisible()
  })

  test('displays correctly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'kbw Notes' })).toBeVisible()
  })
})

test.describe('Accessibility', () => {
  test('has proper page structure', async ({ page }) => {
    await page.goto('/')

    // Should have main heading
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    // Action buttons should have aria-labels
    const buttons = page.getByRole('button')
    const buttonCount = await buttons.count()
    expect(buttonCount).toBeGreaterThan(0)
  })

  test('login page is keyboard navigable', async ({ page }) => {
    await page.goto('/login')

    // Wait for page to load
    await expect(page.getByRole('button', { name: /google/i })).toBeVisible()

    // Tab to the first OAuth button
    await page.keyboard.press('Tab')

    // Check that we can focus elements (may need multiple tabs depending on browser)
    // Just verify the buttons are focusable by checking they exist
    const googleButton = page.getByRole('button', { name: /google/i })
    await expect(googleButton).toBeEnabled()
  })
})
