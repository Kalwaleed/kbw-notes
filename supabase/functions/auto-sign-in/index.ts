import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'

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

// 410 Gone stub. The real magic-link handler lives at /functions/v1/request-magic-link.
// Only stale frontend builds still hit this URL; we log them to auth_audit so we can
// see when it's safe to fully remove this function.
Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const ip = req.headers.get('cf-connecting-ip')
  const userAgent = req.headers.get('user-agent')

  try {
    const admin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )
    await admin.from('auth_audit').insert({
      email: 'unknown',
      event: 'legacy_endpoint',
      ip,
      user_agent: userAgent,
      metadata: { endpoint: 'auto-sign-in' },
    })
  } catch (e) {
    console.error('legacy_endpoint audit failed', { type: e instanceof Error ? e.name : 'unknown' })
  }

  return new Response(
    JSON.stringify({ error: 'gone', upgrade: '/functions/v1/request-magic-link' }),
    {
      status: 410,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    },
  )
})
