// Social-crawler OG preview logic for /kbw-notes/post/:id, consumed by the
// Vercel routing middleware at the repo root (middleware.ts).
//
// The SPA serves one static <head> for every route, so shared post links
// unfurl with generic tags. For known social crawlers we answer with a
// minimal HTML page whose og:/twitter: tags come from the published post;
// humans always fall through to the SPA.
//
// This module must stay dependency-free: it is bundled into the edge
// middleware, where a module-scope failure (e.g. importing the supabase
// client, which reads import.meta.env at import time) would 500 every
// matched request — including human traffic.

// Link-preview fetcher UAs only — deliberately NOT bare app names like
// "LinkedIn" or "FBAN", which appear in human in-app browser UAs.
const CRAWLER_UA_SUBSTRINGS = [
  'twitterbot',
  'linkedinbot',
  'facebookexternalhit',
  'whatsapp',
  'slackbot',
  'discordbot',
  'telegrambot',
]

const POST_PATH_RE = /^\/kbw-notes\/post\/([^/]+)\/?$/
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Mirrors PUBLIC_FEED_RESET_AT + the fetchBlogPost visibility filter in
// src/lib/queries/blog.ts — keep in sync or crawlers will see posts the
// site itself hides.
const PUBLIC_FEED_RESET_AT = '2026-04-30T10:00:28.000Z'

// Site constants mirroring the static tags in index.html.
const SITE_ORIGIN = 'https://kalwaleed.com'
const SITE_NAME = 'kbw Notes'
const TWITTER_HANDLE = '@kbw_notes'
const FALLBACK_IMAGE = `${SITE_ORIGIN}/og-image.png`
const FALLBACK_DESCRIPTION =
  "A working notebook from kbw — articles, ideas, and observations on capital, computation, and the systems we don't yet have words for."

// og:description has no hard spec limit, but X/LinkedIn clip around this
// point anyway; capping bounds the response against oversized excerpts.
const MAX_DESCRIPTION_LENGTH = 300
const MAX_IMAGE_URL_LENGTH = 2048

const FETCH_TIMEOUT_MS = 3000

export interface PostPreview {
  id: string
  title: string
  excerpt: string | null
  coverImageUrl: string | null
}

export interface SupabaseEnv {
  supabaseUrl: string
  anonKey: string
}

export function isSocialCrawler(userAgent: string | null): boolean {
  if (!userAgent) return false
  const ua = userAgent.toLowerCase()
  return CRAWLER_UA_SUBSTRINGS.some((needle) => ua.includes(needle))
}

// Returns the post id from a /kbw-notes/post/:id pathname, or null. The UUID
// gate doubles as the injection guard for the PostgREST query string.
export function extractPostId(pathname: string): string | null {
  const match = POST_PATH_RE.exec(pathname)
  if (!match) return null
  const id = match[1]
  return UUID_RE.test(id) ? id.toLowerCase() : null
}

// The middleware bundle has no Node types in tsconfig (DOM lib), so reach
// process.env through globalThis instead of a global `declare`.
export function readSupabaseEnv(): SupabaseEnv | null {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } })
    .process?.env
  const supabaseUrl = env?.VITE_SUPABASE_URL
  const anonKey = env?.VITE_SUPABASE_ANON_KEY
  if (!supabaseUrl || !anonKey) return null
  return { supabaseUrl, anonKey }
}

// Anon-key PostgREST read of the published post. Any failure — timeout,
// non-2xx, malformed body — returns null so the caller falls through to the
// SPA; a crawler then just gets today's generic tags, never an error.
export async function fetchPostPreview(
  postId: string,
  env: SupabaseEnv,
  timeoutMs: number = FETCH_TIMEOUT_MS
): Promise<PostPreview | null> {
  const params = new URLSearchParams({
    id: `eq.${postId}`,
    status: 'eq.published',
    published_at: `gte.${PUBLIC_FEED_RESET_AT}`,
    select: 'id,title,excerpt,cover_image_url',
    limit: '1',
  })

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(`${env.supabaseUrl}/rest/v1/submissions?${params}`, {
      headers: {
        apikey: env.anonKey,
        Authorization: `Bearer ${env.anonKey}`,
        Accept: 'application/json',
      },
      signal: controller.signal,
    })
    if (!response.ok) return null

    const rows: unknown = await response.json()
    if (!Array.isArray(rows) || rows.length === 0) return null
    const row = rows[0] as Record<string, unknown>
    if (typeof row.title !== 'string' || row.title.length === 0) return null

    return {
      id: postId,
      title: row.title,
      excerpt: typeof row.excerpt === 'string' ? row.excerpt : null,
      coverImageUrl: typeof row.cover_image_url === 'string' ? row.cover_image_url : null,
    }
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value
}

// submissions.cover_image_url has no DB-side format constraint, so guard
// against non-URL schemes and oversized values before echoing it to crawlers.
function safeImageUrl(coverImageUrl: string | null): string {
  if (
    coverImageUrl &&
    coverImageUrl.length <= MAX_IMAGE_URL_LENGTH &&
    /^https?:\/\//i.test(coverImageUrl)
  ) {
    return coverImageUrl
  }
  return FALLBACK_IMAGE
}

export function buildPreviewHtml(preview: PostPreview): string {
  const postUrl = `${SITE_ORIGIN}/kbw-notes/post/${preview.id}`
  const title = escapeHtml(preview.title)
  const rawExcerpt = preview.excerpt?.replace(/\s+/g, ' ').trim() ?? ''
  const description = escapeHtml(
    truncate(rawExcerpt.length > 0 ? rawExcerpt : FALLBACK_DESCRIPTION, MAX_DESCRIPTION_LENGTH)
  )
  const image = escapeHtml(safeImageUrl(preview.coverImageUrl))

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} — ${SITE_NAME}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${postUrl}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="${SITE_NAME}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${postUrl}">
<meta property="og:image" content="${image}">
<meta property="og:image:alt" content="${title}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="${TWITTER_HANDLE}">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${image}">
</head>
<body>
<h1>${title}</h1>
<p>${description}</p>
<p><a href="${postUrl}">Read on kalwaleed.com</a></p>
</body>
</html>
`
}

// Full crawler path: returns the OG preview Response, or null when the
// request should fall through to the SPA (human UA, bad id, missing env,
// unpublished/unknown post, or any fetch failure).
export async function crawlerPreviewResponse(request: Request): Promise<Response | null> {
  if (!isSocialCrawler(request.headers.get('user-agent'))) return null

  const postId = extractPostId(new URL(request.url).pathname)
  if (!postId) return null

  const env = readSupabaseEnv()
  if (!env) return null

  const preview = await fetchPostPreview(postId, env)
  if (!preview) return null

  return new Response(buildPreviewHtml(preview), {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // Deliberately uncached: the URL is shared with human traffic, and a
      // CDN cache keyed on URL could serve this stub to a browser. Crawler
      // volume is a handful of unfurls, not a cost.
      'Cache-Control': 'private, no-store',
      'x-og-middleware': 'hit',
    },
  })
}
