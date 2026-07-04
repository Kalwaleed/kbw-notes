import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'
import { z } from 'https://esm.sh/zod@3.24.1'
import { sanitizeSubmissionText } from '../_shared/sanitize.ts'

// Public reader-submission intake. Replaces the direct client RPC call so that:
//   1. submissions are rate-limited per IP (the RPC had none), and
//   2. cover images are uploaded server-side with the service role, so the
//      client no longer needs an anonymous Supabase session or write access to
//      the storage bucket (both of which were abuse vectors).
//
// The client sends the cover image as a `data:` URL; this function validates
// and uploads it, then inserts via the submit_reader_submission RPC.

const DATA_URL_RE = /^data:(image\/(?:jpeg|png|gif|webp));base64,([A-Za-z0-9+/=]+)$/
const MAX_IMAGE_BYTES = 5 * 1024 * 1024 // 5MB, matches the bucket limit
const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
}

const SubmissionSchema = z.object({
  submitterName: z.string().min(2).max(120),
  submitterEmail: z.string().max(240).optional().nullable(),
  title: z.string().min(3).max(180),
  excerpt: z.string().max(500).optional().default(''),
  content: z.string().min(20).max(30000),
  tags: z.array(z.string()).max(16).optional().default([]),
  // A data: URL (validated below) or empty. Never a raw remote URL — we only
  // publish images we uploaded ourselves.
  coverImage: z.string().max(7_500_000).optional().nullable(),
})

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://kbw-notes.vercel.app',
  'https://kbw-notes.com',
  'https://www.kbw-notes.com',
  'https://kalwaleed.com',
  'https://www.kalwaleed.com',
]

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') || ''
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ''
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': 'true',
  }
}

// Trust only Cloudflare's connecting-ip; other forwarding headers are spoofable.
function getClientIP(req: Request): string | null {
  const cfIP = req.headers.get('cf-connecting-ip')
  return cfIP && cfIP.length > 0 ? cfIP : null
}

const RATE_LIMIT = 5 // submissions per window per IP
const RATE_WINDOW_MS = 10 * 60 * 1000 // 10 minutes

async function checkRateLimit(
  supabaseAdmin: ReturnType<typeof createClient>,
  identifier: string
): Promise<boolean> {
  const { data, error } = await supabaseAdmin.rpc('rate_limit_increment', {
    p_identifier: identifier,
    p_window_ms: RATE_WINDOW_MS,
  })
  if (error) {
    console.error('rate_limit_increment error', { code: error.code })
    return false // fail closed
  }
  const count = typeof data === 'number' ? data : Number(data ?? 0)
  return count <= RATE_LIMIT
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const origin = req.headers.get('origin') || ''
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return new Response(JSON.stringify({ error: 'Unauthorized origin' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // CSRF: require application/json so the browser must preflight.
  const contentType = req.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    return new Response(JSON.stringify({ error: 'Content-Type must be application/json' }), {
      status: 415,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const clientIP = getClientIP(req)
    if (!clientIP) {
      return new Response(JSON.stringify({ error: 'Origin not trusted' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const allowed = await checkRateLimit(supabaseAdmin, `reader_submission:${clientIP}`)
    if (!allowed) {
      return new Response(
        JSON.stringify({ error: 'Too many submissions. Please wait a few minutes and try again.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const parsed = SubmissionSchema.safeParse(await req.json())
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid submission', details: parsed.error.format() }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    const input = parsed.data

    // Upload the cover image server-side if one was provided.
    let coverImageUrl: string | null = null
    if (input.coverImage && input.coverImage.length > 0) {
      const match = DATA_URL_RE.exec(input.coverImage)
      if (!match) {
        return new Response(
          JSON.stringify({ error: 'Cover image must be a PNG, JPG, GIF, or WebP.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      const [, mime, b64] = match
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
      if (bytes.byteLength > MAX_IMAGE_BYTES) {
        return new Response(
          JSON.stringify({ error: 'Cover image exceeds the 5MB limit.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      const path = `reader-submissions/${crypto.randomUUID()}.${EXT_BY_MIME[mime]}`
      const { error: uploadError } = await supabaseAdmin.storage
        .from('post-images')
        .upload(path, bytes, { contentType: mime, upsert: false })
      if (uploadError) {
        console.error('cover upload failed', { message: uploadError.message })
        return new Response(
          JSON.stringify({ error: 'Could not store the cover image. Try again without it.' }),
          { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      coverImageUrl = supabaseAdmin.storage.from('post-images').getPublicUrl(path).data.publicUrl
    }

    // Insert via the RPC (all field-level validation lives there).
    // Text fields are sanitized at this boundary: the intake form is a plain
    // <textarea>, so stored rows must never contain markup. A future admin
    // review UI MUST still route reader_submissions.* through
    // src/lib/content/contentRenderer.ts before any dangerouslySetInnerHTML.
    const { data: id, error: rpcError } = await supabaseAdmin.rpc('submit_reader_submission', {
      p_submitter_name: sanitizeSubmissionText(input.submitterName.trim()),
      p_submitter_email: input.submitterEmail?.trim() || null,
      p_title: sanitizeSubmissionText(input.title.trim()),
      p_excerpt: sanitizeSubmissionText(input.excerpt.trim()),
      p_content: sanitizeSubmissionText(input.content.trim()),
      p_tags: input.tags.map((tag) => sanitizeSubmissionText(tag)),
      p_cover_image_url: coverImageUrl,
    })

    if (rpcError) {
      console.error('submit_reader_submission failed', { code: rpcError.code })
      return new Response(
        JSON.stringify({ error: rpcError.message || 'Submission failed.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(JSON.stringify({ id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Unexpected error', { type: error instanceof Error ? error.name : 'unknown' })
    return new Response(JSON.stringify({ error: 'An unexpected error occurred. Please try again.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
