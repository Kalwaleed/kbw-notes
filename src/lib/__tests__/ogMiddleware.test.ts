// Tests the middleware wrapper in isolation (module mock on socialPreview);
// the preview logic itself is covered by socialPreview.test.ts. Separate file
// because vi.mock is file-scoped and would shadow the real module there.
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSocialPreview = vi.hoisted(() => ({
  crawlerPreviewResponse: vi.fn(),
}))

vi.mock('../socialPreview', () => mockSocialPreview)

import middleware, { config } from '../../../middleware'

describe('middleware', () => {
  beforeEach(() => {
    mockSocialPreview.crawlerPreviewResponse.mockReset()
  })

  const request = new Request('https://kalwaleed.com/kbw-notes/post/123e4567-e89b-42d3-a456-426614174000')

  it('only matches post detail routes', () => {
    expect(config.matcher).toBe('/kbw-notes/post/:id')
  })

  it('returns the crawler preview response unchanged when one is produced', async () => {
    const preview = new Response('<html>og</html>', {
      headers: { 'x-og-middleware': 'hit' },
    })
    mockSocialPreview.crawlerPreviewResponse.mockResolvedValue(preview)

    const response = await middleware(request)

    expect(response).toBe(preview)
    expect(mockSocialPreview.crawlerPreviewResponse).toHaveBeenCalledWith(request)
  })

  it('continues to the SPA when there is no preview', async () => {
    mockSocialPreview.crawlerPreviewResponse.mockResolvedValue(null)

    const response = await middleware(request)

    // @vercel/functions marks a continue-response with x-middleware-next
    expect(response.headers.get('x-middleware-next')).toBe('1')
    expect(response.headers.get('x-og-middleware')).toBe('pass')
  })

  it('continues to the SPA even when the preview path throws', async () => {
    mockSocialPreview.crawlerPreviewResponse.mockRejectedValue(new Error('unexpected'))

    const response = await middleware(request)

    expect(response.headers.get('x-middleware-next')).toBe('1')
    expect(response.headers.get('x-og-middleware')).toBe('pass')
  })
})
