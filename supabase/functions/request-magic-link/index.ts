import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'
import { z } from 'https://esm.sh/zod@3.24.1'

const SignInRequestSchema = z.object({
  email: z.string().email().max(254),
  redirectTo: z.string().url().optional(),
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

const ALLOWED_REDIRECT_ORIGINS = ALLOWED_ORIGINS

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') || ''
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ''
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': 'true',
  }
}

// Trust only Cloudflare's connecting-ip header. cf-connecting-ip is set by
// Cloudflare and is not forwardable from clients. x-forwarded-for / x-real-ip
// can be spoofed when the platform is hit directly.
function getClientIP(req: Request): string | null {
  const cfIP = req.headers.get('cf-connecting-ip')
  return cfIP && cfIP.length > 0 ? cfIP : null
}

const RATE_LIMIT_PER_IP = 5
const RATE_LIMIT_PER_EMAIL = 3
const RATE_WINDOW_MS = 60 * 1000

async function checkRateLimitAtomic(
  admin: ReturnType<typeof createClient>,
  identifier: string,
  limit: number,
): Promise<boolean> {
  const { data, error } = await admin.rpc('rate_limit_increment', {
    p_identifier: identifier,
    p_window_ms: RATE_WINDOW_MS,
  })
  if (error) {
    console.error('rate_limit_increment error', { code: error.code })
    return false
  }
  const count = typeof data === 'number' ? data : Number(data ?? 0)
  return count <= limit
}

async function logAudit(
  admin: ReturnType<typeof createClient>,
  row: {
    email: string
    event: string
    ip: string | null
    user_agent: string | null
    metadata?: Record<string, unknown>
  },
): Promise<void> {
  const { error } = await admin.from('auth_audit').insert({
    email: row.email,
    event: row.event,
    ip: row.ip,
    user_agent: row.user_agent,
    metadata: row.metadata ?? null,
  })
  if (error) {
    console.error('auth_audit insert failed', { code: error.code })
  }
}

function jsonResponse(body: unknown, status: number, corsHeaders: Record<string, string>): Response {
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

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405, corsHeaders)
  }

  const origin = req.headers.get('origin') || ''
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return jsonResponse({ error: 'Unauthorized origin' }, 403, corsHeaders)
  }

  const contentType = req.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    return jsonResponse({ error: 'Content-Type must be application/json' }, 415, corsHeaders)
  }

  const admin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  const ip = getClientIP(req)
  const userAgent = req.headers.get('user-agent')

  if (!ip) {
    return jsonResponse({ error: 'Origin not trusted' }, 403, corsHeaders)
  }

  const ipAllowed = await checkRateLimitAtomic(admin, `auth_ip:${ip}`, RATE_LIMIT_PER_IP)
  if (!ipAllowed) {
    await logAudit(admin, { email: 'unknown', event: 'rate_limited', ip, user_agent: userAgent, metadata: { scope: 'ip' } })
    return jsonResponse({ ok: true }, 200, corsHeaders)
  }

  let parsed: z.infer<typeof SignInRequestSchema>
  try {
    parsed = SignInRequestSchema.parse(await req.json())
  } catch {
    return jsonResponse({ error: 'Invalid request' }, 400, corsHeaders)
  }

  const email = parsed.email.normalize('NFKC').toLowerCase().trim()
  const emailRateAllowed = await checkRateLimitAtomic(admin, `auth_email:${email}`, RATE_LIMIT_PER_EMAIL)

  if (!email.endsWith('@kbw.vc')) {
    await logAudit(admin, { email, event: 'denied_domain', ip, user_agent: userAgent })
    return jsonResponse({ ok: true }, 200, corsHeaders)
  }

  if (!emailRateAllowed) {
    await logAudit(admin, { email, event: 'rate_limited', ip, user_agent: userAgent, metadata: { scope: 'email' } })
    return jsonResponse({ ok: true }, 200, corsHeaders)
  }

  const { data: invite, error: inviteError } = await admin
    .from('invited_emails')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (inviteError) {
    console.error('Invite check error', { code: inviteError.code })
    await logAudit(admin, { email, event: 'send_failed', ip, user_agent: userAgent, metadata: { reason: 'invite_lookup' } })
    return jsonResponse({ ok: true }, 200, corsHeaders)
  }

  if (!invite) {
    await logAudit(admin, { email, event: 'denied_not_invited', ip, user_agent: userAgent })
    return jsonResponse({ ok: true }, 200, corsHeaders)
  }

  let redirectTo: string | undefined
  if (parsed.redirectTo) {
    try {
      const u = new URL(parsed.redirectTo)
      if (ALLOWED_REDIRECT_ORIGINS.includes(u.origin)) {
        redirectTo = u.toString()
      }
    } catch {
      // ignore malformed redirect
    }
  }

  const { error: otpError } = await admin.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: redirectTo,
    },
  })

  if (otpError) {
    console.error('signInWithOtp failed', { message: otpError.message })
    await logAudit(admin, { email, event: 'send_failed', ip, user_agent: userAgent, metadata: { reason: 'otp_send' } })
    return jsonResponse({ ok: true }, 200, corsHeaders)
  }

  await logAudit(admin, { email, event: 'link_requested', ip, user_agent: userAgent })
  return jsonResponse({ ok: true }, 200, corsHeaders)
})
