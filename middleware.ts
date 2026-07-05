// Vercel routing middleware: social crawlers hitting a post URL get minimal
// HTML with per-post og:/twitter: tags (see src/lib/socialPreview.ts);
// everything else falls through to the SPA rewrite in vercel.json.
//
// Failure policy: this route must never error because of the preview path —
// a broken crawler branch degrades to the SPA's generic tags, nothing more.
// The x-og-middleware header (hit|pass) exists so a live deploy can be
// verified with curl instead of guessing from card validators.

import { next } from '@vercel/functions'
import { crawlerPreviewResponse } from './src/lib/socialPreview'

export const config = { matcher: '/kbw-notes/post/:id' }

export default async function middleware(request: Request): Promise<Response> {
  try {
    const preview = await crawlerPreviewResponse(request)
    if (preview) return preview
  } catch {
    // fall through to the SPA
  }
  return next({ headers: { 'x-og-middleware': 'pass' } })
}
