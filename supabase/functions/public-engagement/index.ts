import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'
import { z } from 'https://esm.sh/zod@3.24.1'

// Anonymous engagement endpoint: device-scoped post/comment likes and
// comment reports. The browser has no direct write access to these tables
// (RLS); this function is the only writer for anonymous rows. It calls the
// service-role-only *_anon RPCs from migration 20260705093249.

const RequestSchema = z.object({
  action: z.enum(['toggle_post_like', 'toggle_comment_like', 'report_comment']),
  targetId: z.string().uuid(),
  anonId: z.string().uuid(),
})

// Allowed origins for CORS (mirrors moderate-comment)
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
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': 'true',
  }
}

// Likes are chatty (toggle on/off), so the window is more generous than
// comments but still bounds count inflation from a single IP.
const RATE_LIMIT = 30 // actions per minute
const RATE_WINDOW_MS = 60 * 1000

// Trust only Cloudflare's connecting-ip header (see moderate-comment).
function getClientIP(req: Request): string | null {
  const cfIP = req.headers.get('cf-connecting-ip')
  return cfIP && cfIP.length > 0 ? cfIP : null
}

function json(body: unknown, status: number, corsHeaders: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const origin = req.headers.get('origin') || ''
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return json({ error: 'Unauthorized origin' }, 403, corsHeaders)
  }

  // CSRF protection: require application/json (forces a CORS preflight)
  const contentType = req.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    return json({ error: 'Content-Type must be application/json' }, 415, corsHeaders)
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const clientIP = getClientIP(req)
    if (!clientIP) {
      return json({ error: 'Origin not trusted' }, 403, corsHeaders)
    }

    // Atomic rate limit via rate_limit_increment RPC (migration 018)
    const { data: rlData, error: rlError } = await supabaseAdmin.rpc('rate_limit_increment', {
      p_identifier: `engage:${clientIP}`,
      p_window_ms: RATE_WINDOW_MS,
    })
    if (rlError) {
      console.error('rate_limit_increment error', { code: rlError.code })
      return json({ error: 'Service unavailable. Please try again.' }, 503, corsHeaders)
    }
    const rlCount = typeof rlData === 'number' ? rlData : Number(rlData ?? 0)
    if (rlCount > RATE_LIMIT) {
      return json({ error: 'Too many actions. Please wait a moment.' }, 429, corsHeaders)
    }

    const rawBody = await req.json()
    const parsed = RequestSchema.safeParse(rawBody)
    if (!parsed.success) {
      return json({ error: 'Invalid request format' }, 400, corsHeaders)
    }
    const { action, targetId, anonId } = parsed.data

    if (action === 'report_comment') {
      const { data, error } = await supabaseAdmin.rpc('report_comment_anon', {
        p_comment_id: targetId,
        p_anon_id: anonId,
      })
      if (error) {
        if (error.code === 'P0002') return json({ error: 'Comment not found' }, 404, corsHeaders)
        console.error('report_comment_anon error', { code: error.code })
        return json({ error: 'Failed to report comment.' }, 500, corsHeaders)
      }
      return json({ reported: true, alreadyReported: data === false }, 200, corsHeaders)
    }

    const rpcName = action === 'toggle_post_like' ? 'toggle_post_like_anon' : 'toggle_comment_like_anon'
    const rpcArgs = action === 'toggle_post_like'
      ? { p_post_id: targetId, p_anon_id: anonId }
      : { p_comment_id: targetId, p_anon_id: anonId }

    const { data, error } = await supabaseAdmin.rpc(rpcName, rpcArgs)
    if (error) {
      if (error.code === 'P0002') return json({ error: 'Target not found' }, 404, corsHeaders)
      console.error(`${rpcName} error`, { code: error.code })
      return json({ error: 'Failed to toggle like.' }, 500, corsHeaders)
    }

    // RETURNS TABLE comes back as an array with a single row
    const row = Array.isArray(data) ? data[0] : data
    return json(
      { liked: Boolean(row?.liked), count: Number(row?.like_count ?? 0) },
      200,
      corsHeaders
    )
  } catch (error) {
    console.error('Unexpected error:', { type: error instanceof Error ? error.name : 'unknown' })
    return json({ error: 'An unexpected error occurred. Please try again.' }, 500, corsHeaders)
  }
})
