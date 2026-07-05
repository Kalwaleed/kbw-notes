import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  isSocialCrawler,
  extractPostId,
  readSupabaseEnv,
  fetchPostPreview,
  buildPreviewHtml,
  crawlerPreviewResponse,
} from '../socialPreview'

const POST_ID = '123e4567-e89b-42d3-a456-426614174000'
const ENV = { supabaseUrl: 'https://example.supabase.co', anonKey: 'anon-key-123' }

const PREVIEW = {
  id: POST_ID,
  title: 'The Advantage Is the Operating System',
  excerpt: 'Capital is abundant. The scarce layer is the operating system.',
  coverImageUrl: 'https://example.supabase.co/storage/v1/object/public/post-images/cover.jpg',
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.useRealTimers()
})

describe('isSocialCrawler', () => {
  it.each([
    ['Mozilla/5.0 (compatible; Twitterbot/1.0)'],
    ['LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)'],
    ['facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'],
    ['WhatsApp/2.23.20.0'],
    ['Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)'],
    ['Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)'],
    ['TelegramBot (like TwitterBot)'],
  ])('matches crawler UA %s', (ua) => {
    expect(isSocialCrawler(ua)).toBe(true)
  })

  it.each([
    ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'],
    ['Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'],
    // LinkedIn's human in-app browser is not the LinkedInBot unfurler
    ['Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 Chrome/126.0 Mobile Safari/537.36 LinkedInApp'],
    // Search engines keep getting the SPA — this feature is for social unfurls only
    ['Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'],
    [''],
  ])('does not match human/other UA %s', (ua) => {
    expect(isSocialCrawler(ua)).toBe(false)
  })

  it('does not match a missing UA header', () => {
    expect(isSocialCrawler(null)).toBe(false)
  })
})

describe('extractPostId', () => {
  it('extracts a valid post UUID', () => {
    expect(extractPostId(`/kbw-notes/post/${POST_ID}`)).toBe(POST_ID)
  })

  it('accepts a trailing slash and normalizes case', () => {
    expect(extractPostId(`/kbw-notes/post/${POST_ID.toUpperCase()}/`)).toBe(POST_ID)
  })

  it.each([
    ['/kbw-notes/home'],
    ['/kbw-notes/post/'],
    ['/kbw-notes/post/not-a-uuid'],
    ['/kbw-notes/post/<script>alert(1)</script>'],
    [`/kbw-notes/post/${POST_ID}/extra`],
    [`/other/post/${POST_ID}`],
  ])('rejects %s', (pathname) => {
    expect(extractPostId(pathname)).toBeNull()
  })
})

describe('readSupabaseEnv', () => {
  it('reads both Supabase vars from process.env', () => {
    vi.stubEnv('VITE_SUPABASE_URL', ENV.supabaseUrl)
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', ENV.anonKey)
    expect(readSupabaseEnv()).toEqual(ENV)
  })

  it.each([
    ['VITE_SUPABASE_URL'],
    ['VITE_SUPABASE_ANON_KEY'],
  ])('returns null when %s is missing', (present) => {
    vi.stubEnv('VITE_SUPABASE_URL', '')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')
    vi.stubEnv(present, 'set')
    expect(readSupabaseEnv()).toBeNull()
  })
})

describe('fetchPostPreview', () => {
  it('queries PostgREST with the published-post visibility filter and anon auth', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse([
        {
          id: POST_ID,
          title: PREVIEW.title,
          excerpt: PREVIEW.excerpt,
          cover_image_url: PREVIEW.coverImageUrl,
        },
      ])
    )
    vi.stubGlobal('fetch', fetchMock)

    const preview = await fetchPostPreview(POST_ID, ENV)

    expect(preview).toEqual(PREVIEW)
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain(`${ENV.supabaseUrl}/rest/v1/submissions?`)
    expect(url).toContain(`id=eq.${POST_ID}`)
    expect(url).toContain('status=eq.published')
    // Mirrors PUBLIC_FEED_RESET_AT in queries/blog.ts (URL-encoded by URLSearchParams)
    expect(decodeURIComponent(url)).toContain('published_at=gte.2026-04-30T10:00:28.000Z')
    const headers = init.headers as Record<string, string>
    expect(headers.apikey).toBe(ENV.anonKey)
    expect(headers.Authorization).toBe(`Bearer ${ENV.anonKey}`)
  })

  it('maps missing excerpt and cover to null', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse([{ id: POST_ID, title: 'T', excerpt: null, cover_image_url: null }]))
    )
    expect(await fetchPostPreview(POST_ID, ENV)).toEqual({
      id: POST_ID,
      title: 'T',
      excerpt: null,
      coverImageUrl: null,
    })
  })

  it('returns null when no row matches (draft or unknown post)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse([])))
    expect(await fetchPostPreview(POST_ID, ENV)).toBeNull()
  })

  it('returns null on a non-2xx response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ message: 'error' }, 500)))
    expect(await fetchPostPreview(POST_ID, ENV)).toBeNull()
  })

  it('returns null when the row has no usable title', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse([{ id: POST_ID, title: '' }])))
    expect(await fetchPostPreview(POST_ID, ENV)).toBeNull()
  })

  it('returns null when fetch rejects', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network down')))
    expect(await fetchPostPreview(POST_ID, ENV)).toBeNull()
  })

  it('returns null when the request outlives the timeout', async () => {
    vi.useFakeTimers()
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            init.signal?.addEventListener('abort', () =>
              reject(new DOMException('aborted', 'AbortError'))
            )
          })
      )
    )
    const pending = fetchPostPreview(POST_ID, ENV, 3000)
    await vi.advanceTimersByTimeAsync(3000)
    expect(await pending).toBeNull()
  })
})

describe('buildPreviewHtml', () => {
  it('renders the full og/twitter tag set for a post', () => {
    const html = buildPreviewHtml(PREVIEW)
    const postUrl = `https://kalwaleed.com/kbw-notes/post/${POST_ID}`
    expect(html).toContain(`<meta property="og:title" content="${PREVIEW.title}">`)
    expect(html).toContain(`<meta property="og:description" content="${PREVIEW.excerpt}">`)
    expect(html).toContain(`<meta property="og:image" content="${PREVIEW.coverImageUrl}">`)
    expect(html).toContain(`<meta property="og:url" content="${postUrl}">`)
    expect(html).toContain('<meta property="og:type" content="article">')
    expect(html).toContain('<meta property="og:site_name" content="kbw Notes">')
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image">')
    expect(html).toContain('<meta name="twitter:site" content="@KbwNotes">')
    expect(html).toContain(`<link rel="canonical" href="${postUrl}">`)
  })

  it('HTML-escapes title and excerpt', () => {
    const html = buildPreviewHtml({
      ...PREVIEW,
      title: `"Quotes" & <script>alert('x')</script>`,
      excerpt: `5 < 10 & "so on"`,
    })
    expect(html).not.toContain('<script>')
    expect(html).toContain('&quot;Quotes&quot; &amp; &lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt;')
    expect(html).toContain('5 &lt; 10 &amp; &quot;so on&quot;')
  })

  it('falls back to the site description when the excerpt is empty', () => {
    for (const excerpt of [null, '', '   ']) {
      const html = buildPreviewHtml({ ...PREVIEW, excerpt })
      expect(html).toContain('A working notebook from kbw')
    }
  })

  it('collapses whitespace and truncates an oversized excerpt', () => {
    const html = buildPreviewHtml({ ...PREVIEW, excerpt: `a\n\nb ${'long '.repeat(100)}` })
    expect(html).toContain('a b long')
    const description = /<meta property="og:description" content="([^"]*)">/.exec(html)?.[1]
    expect(description).toBeDefined()
    expect(description!.length).toBeLessThanOrEqual(300)
    expect(description!.endsWith('…')).toBe(true)
  })

  it.each([
    ['null cover', null],
    ['non-http scheme', 'javascript:alert(1)'],
    ['relative path', '/relative/cover.jpg'],
    ['oversized URL', `https://example.com/${'a'.repeat(3000)}`],
  ])('uses the site fallback image for %s', (_label, coverImageUrl) => {
    const html = buildPreviewHtml({ ...PREVIEW, coverImageUrl })
    expect(html).toContain('<meta property="og:image" content="https://kalwaleed.com/og-image.png">')
    expect(html).not.toContain('javascript:')
  })
})

describe('crawlerPreviewResponse', () => {
  function stubHappyPath() {
    vi.stubEnv('VITE_SUPABASE_URL', ENV.supabaseUrl)
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', ENV.anonKey)
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse([
        {
          id: POST_ID,
          title: PREVIEW.title,
          excerpt: PREVIEW.excerpt,
          cover_image_url: PREVIEW.coverImageUrl,
        },
      ])
    )
    vi.stubGlobal('fetch', fetchMock)
    return fetchMock
  }

  function postRequest(userAgent?: string, path = `/kbw-notes/post/${POST_ID}`) {
    return new Request(`https://kalwaleed.com${path}`, {
      headers: userAgent ? { 'user-agent': userAgent } : {},
    })
  }

  it('serves the OG preview to a crawler', async () => {
    stubHappyPath()
    const response = await crawlerPreviewResponse(postRequest('Twitterbot/1.0'))
    expect(response).not.toBeNull()
    expect(response!.status).toBe(200)
    expect(response!.headers.get('Content-Type')).toBe('text/html; charset=utf-8')
    expect(response!.headers.get('Cache-Control')).toBe('private, no-store')
    expect(response!.headers.get('x-og-middleware')).toBe('hit')
    expect(await response!.text()).toContain(PREVIEW.title)
  })

  it('ignores human traffic without touching the network', async () => {
    const fetchMock = stubHappyPath()
    const response = await crawlerPreviewResponse(
      postRequest('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/126.0.0.0')
    )
    expect(response).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('ignores non-UUID post paths without touching the network', async () => {
    const fetchMock = stubHappyPath()
    const response = await crawlerPreviewResponse(
      postRequest('Twitterbot/1.0', '/kbw-notes/post/not-a-uuid')
    )
    expect(response).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('falls through when the Supabase env is not configured', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    vi.stubEnv('VITE_SUPABASE_URL', '')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')
    const response = await crawlerPreviewResponse(postRequest('Twitterbot/1.0'))
    expect(response).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('falls through when the post fetch fails', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', ENV.supabaseUrl)
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', ENV.anonKey)
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network down')))
    expect(await crawlerPreviewResponse(postRequest('Twitterbot/1.0'))).toBeNull()
  })
})
