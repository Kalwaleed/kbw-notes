import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'
import { z } from 'https://deno.land/x/zod@v3.24.1/mod.ts'

const SignInRequestSchema = z.object({
  email: z.string().email().max(254),
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
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': 'true',
  }
}

function getClientIP(req: Request): string {
  const cfIP = req.headers.get('cf-connecting-ip')
  if (cfIP) return cfIP
  const realIP = req.headers.get('x-real-ip')
  if (realIP) return realIP
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return 'unknown'
}

const RATE_LIMIT = 5
const RATE_WINDOW_MS = 60 * 1000

async function checkRateLimit(
  supabaseAdmin: ReturnType<typeof createClient>,
  identifier: string
): Promise<boolean> {
  const now = new Date()
  const windowStart = new Date(now.getTime() - RATE_WINDOW_MS)

  const { data: existing } = await supabaseAdmin
    .from('rate_limits')
    .select('*')
    .eq('identifier', identifier)
    .single()

  if (!existing) {
    await supabaseAdmin.from('rate_limits').insert({
      identifier,
      count: 1,
      window_start: now.toISOString(),
    })
    return true
  }

  const windowStartTime = new Date(existing.window_start)
  if (windowStartTime < windowStart) {
    await supabaseAdmin
      .from('rate_limits')
      .update({
        count: 1,
        window_start: now.toISOString(),
      })
      .eq('identifier', identifier)
    return true
  }

  if (existing.count >= RATE_LIMIT) {
    return false
  }

  await supabaseAdmin
    .from('rate_limits')
    .update({ count: existing.count + 1 })
    .eq('identifier', identifier)

  return true
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

  const contentType = req.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    return new Response(
      JSON.stringify({ error: 'Content-Type must be application/json' }),
      {
        status: 415,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const clientIP = getClientIP(req)
    const allowed = await checkRateLimit(supabaseAdmin, `auth:${clientIP}`)
    if (!allowed) {
      return new Response(
        JSON.stringify({
          error: 'Too many sign-in attempts. Please wait a moment.',
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const rawBody = await req.json()
    const parseResult = SignInRequestSchema.safeParse(rawBody)

    if (!parseResult.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid request format' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const email = parseResult.data.email
      .normalize('NFKC')
      .toLowerCase()
      .trim()

    // Validate @kbw.vc domain
    if (!email.endsWith('@kbw.vc')) {
      return new Response(
        JSON.stringify({ error: 'Only @kbw.vc emails are allowed' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Check invited_emails table
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('invited_emails')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (inviteError) {
      console.error('Invite check error:', { code: inviteError.code })
      return new Response(
        JSON.stringify({ error: 'Unable to verify invite status' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (!invite) {
      return new Response(
        JSON.stringify({ error: 'not_invited' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Generate magic link server-side (no email sent)
    const { data: linkData, error: linkError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email,
      })

    if (linkError || !linkData?.properties?.hashed_token) {
      console.error('Generate link error:', {
        message: linkError?.message,
        hasData: !!linkData,
      })
      return new Response(
        JSON.stringify({ error: 'Failed to generate sign-in link' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(
      JSON.stringify({ token_hash: linkData.properties.hashed_token }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Unexpected error:', {
      type: error instanceof Error ? error.name : 'unknown',
    })
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
