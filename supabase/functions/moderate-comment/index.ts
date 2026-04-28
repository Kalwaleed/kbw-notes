import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'
import { z } from 'https://deno.land/x/zod@v3.24.1/mod.ts'

// Request validation schema
const ModerationRequestSchema = z.object({
  postId: z.string().uuid(),
  content: z.string().min(1).max(500), // ~1 paragraph limit
  parentId: z.string().uuid().nullable().optional(),
})

// Response validation schema for Claude API
const ModerationResultSchema = z.object({
  approved: z.boolean(),
  category: z.enum([
    'approved',
    'hate_speech',
    'harassment',
    'profanity',
    'explicit',
    'spam',
    'misinformation',
    'illegal',
    'error',
  ]),
  reason: z.string().nullable(),
})

interface ModerationResponse {
  approved: boolean
  commentId?: string
  rejectionReason?: string
  category?: string
}

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://kbw-notes.vercel.app',
  'https://kbw-notes.com',
  'https://www.kbw-notes.com',
  'https://kalwaleed.com',
  'https://www.kalwaleed.com',
]

// Get CORS headers based on request origin
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

// The moderation system prompt
const MODERATION_SYSTEM_PROMPT = `You are a content moderation system for a blog. Your job is to filter out genuinely harmful content while allowing normal human conversation.

REJECT comments ONLY if they contain:
1. HATE SPEECH: Slurs, discrimination, or attacks based on race, ethnicity, religion, gender, sexual orientation, disability, or national origin
2. HARASSMENT: Personal attacks, bullying, threats, intimidation, or doxxing
3. PROFANITY: Vulgar language, obscenities, or crude sexual references
4. EXPLICIT CONTENT: Sexual content, graphic violence, or gore
5. SPAM: Promotional links, repetitive text, or complete gibberish
6. MISINFORMATION: Dangerous medical/legal advice presented as fact
7. ILLEGAL CONTENT: Content promoting illegal activities

APPROVE everything else. Blog posts cover a wide range of topics — comments do NOT need to be technical. Short comments, casual reactions, personal opinions, humor, emojis, and simple agreement/disagreement are all fine. When in doubt, APPROVE.

Respond ONLY with a JSON object in this exact format:
{
  "approved": boolean,
  "category": "approved" | "hate_speech" | "harassment" | "profanity" | "explicit" | "spam" | "misinformation" | "illegal",
  "reason": "A brief explanation of why the comment was rejected. If approved, set to null."
}`

// Rate limit configuration
const RATE_LIMIT = 10 // comments per minute
const RATE_WINDOW_MS = 60 * 1000 // 1 minute

// Trust only Cloudflare's connecting-ip header. x-real-ip and x-forwarded-for
// are spoofable when the platform is reached directly. If cf-connecting-ip is
// missing, return null and refuse the request.
function getClientIP(req: Request): string | null {
  const cfIP = req.headers.get('cf-connecting-ip')
  return cfIP && cfIP.length > 0 ? cfIP : null
}

// Normalize Unicode and sanitize input
function sanitizeContent(content: string): string {
  return (
    content
      .trim()
      .normalize('NFKC') // Unicode normalization
      // eslint-disable-next-line no-control-regex
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Strip control characters
      .replace(/\s+/g, ' ')
  ) // Normalize whitespace
}

// Atomic rate limit via the rate_limit_increment RPC (migration 018).
// Returns true if the increment kept us within the limit, false if it tripped.
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
    return false
  }
  const count = typeof data === 'number' ? data : Number(data ?? 0)
  return count <= RATE_LIMIT
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Reject requests from unauthorized origins
  const origin = req.headers.get('origin') || ''
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return new Response(JSON.stringify({ error: 'Unauthorized origin' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // CSRF Protection: Require application/json Content-Type
  // This forces a preflight request, preventing simple CSRF attacks via HTML forms
  const contentType = req.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    return new Response(
      JSON.stringify({ error: 'Content-Type must be application/json' }),
      {
        status: 415, // Unsupported Media Type
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  try {
    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get client IP for rate limiting
    const clientIP = getClientIP(req)
    if (!clientIP) {
      return new Response(
        JSON.stringify({ error: 'Origin not trusted' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Check rate limit (atomic via Postgres RPC)
    const allowed = await checkRateLimit(supabaseAdmin, `comment:${clientIP}`)
    if (!allowed) {
      return new Response(
        JSON.stringify({
          error: 'Too many comments. Please wait a moment before trying again.',
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Parse and validate request body
    const rawBody = await req.json()
    const parseResult = ModerationRequestSchema.safeParse(rawBody)

    if (!parseResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request format',
          details: parseResult.error.format(),
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const { postId, content, parentId } = parseResult.data

    // Sanitize content (Unicode normalization, control char removal)
    const sanitizedContent = sanitizeContent(content)

    if (sanitizedContent.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Comment content cannot be empty' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Validate post exists (check submissions table for published posts)
    const { data: post, error: postError } = await supabaseAdmin
      .from('submissions')
      .select('id')
      .eq('id', postId)
      .eq('status', 'published')
      .single()

    if (postError || !post) {
      return new Response(JSON.stringify({ error: 'Post not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Validate parent comment if provided
    if (parentId) {
      const { data: parentComment, error: parentError } = await supabaseAdmin
        .from('comments')
        .select('id, post_id')
        .eq('id', parentId)
        .single()

      if (parentError || !parentComment) {
        return new Response(
          JSON.stringify({ error: 'Parent comment not found' }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      // Ensure parent belongs to the same post
      if (parentComment.post_id !== postId) {
        return new Response(
          JSON.stringify({ error: 'Parent comment does not belong to this post' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }
    }

    // Get user from auth header (optional - allows anonymous comments)
    let userId: string | null = null
    const authHeader = req.headers.get('authorization')
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const {
        data: { user },
      } = await supabaseAdmin.auth.getUser(token)
      userId = user?.id ?? null
    }

    // Call Anthropic API for moderation. Hard timeout + one retry. On final
    // failure we degrade gracefully: insert the comment as unmoderated (which
    // means it stays out of public reads) so user input is not lost and admins
    // can review the queue.
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY') || Deno.env.get('ClaudeCode')

    const ANTHROPIC_TIMEOUT_MS = 5000
    const ANTHROPIC_MAX_ATTEMPTS = 2

    async function callAnthropicOnce(): Promise<Response> {
      const controller = new AbortController()
      const t = setTimeout(() => controller.abort(), ANTHROPIC_TIMEOUT_MS)
      try {
        return await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicApiKey ?? '',
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 256,
            system: MODERATION_SYSTEM_PROMPT,
            messages: [
              {
                role: 'user',
                content: `Evaluate this comment for a tech blog:\n\n"${sanitizedContent}"`,
              },
            ],
          }),
          signal: controller.signal,
        })
      } finally {
        clearTimeout(t)
      }
    }

    async function insertPendingComment(): Promise<Response> {
      const { error: pendingErr } = await supabaseAdmin
        .from('comments')
        .insert({
          post_id: postId,
          user_id: userId,
          content: sanitizedContent,
          parent_id: parentId || null,
          is_moderated: false,
        })
      if (pendingErr) {
        console.error('Pending insert error', { code: pendingErr.code })
        return new Response(
          JSON.stringify({ error: 'Could not queue comment for review.' }),
          { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      return new Response(
        JSON.stringify({
          approved: false,
          pending: true,
          rejectionReason: 'Moderation is temporarily unavailable. Your comment has been queued for admin review.',
        }),
        { status: 202, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!anthropicApiKey) {
      return await insertPendingComment()
    }

    let anthropicResponse: Response | null = null
    let lastError: unknown = null
    for (let attempt = 1; attempt <= ANTHROPIC_MAX_ATTEMPTS; attempt++) {
      try {
        const r = await callAnthropicOnce()
        if (r.ok) {
          anthropicResponse = r
          break
        }
        lastError = `status_${r.status}`
        if (r.status >= 400 && r.status < 500 && r.status !== 429) {
          // 4xx (other than rate limit) won't recover on retry
          break
        }
      } catch (err) {
        lastError = err instanceof Error ? err.name : 'fetch_error'
      }
    }

    if (!anthropicResponse) {
      console.error('Anthropic call failed after retries', { lastError })
      return await insertPendingComment()
    }

    const anthropicData = await anthropicResponse.json()
    const moderationText = anthropicData.content?.[0]?.text ?? ''

    // Parse and validate moderation result with Zod
    let moderationResult: z.infer<typeof ModerationResultSchema>
    try {
      const cleanedText = moderationText.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim()
      const parsed = JSON.parse(cleanedText)
      const validated = ModerationResultSchema.safeParse(parsed)

      if (!validated.success) {
        console.error('Invalid moderation response schema:', JSON.stringify(validated.error.format()))
        return await insertPendingComment()
      }
      moderationResult = validated.data
    } catch (parseErr) {
      console.error('Failed to parse moderation response:', moderationText.substring(0, 200))
      return await insertPendingComment()
    }

    // If rejected, return immediately with reason
    if (!moderationResult.approved) {
      const response: ModerationResponse = {
        approved: false,
        rejectionReason:
          moderationResult.reason ||
          'Your comment was rejected for violating community guidelines.',
        category: moderationResult.category,
      }
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // If approved, insert the comment
    const { data: comment, error: insertError } = await supabaseAdmin
      .from('comments')
      .insert({
        post_id: postId,
        user_id: userId, // Can be null for anonymous
        content: sanitizedContent,
        parent_id: parentId || null,
        is_moderated: true,
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('Insert error:', { code: insertError.code })
      return new Response(
        JSON.stringify({ error: 'Failed to save comment. Please try again.' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const response: ModerationResponse = {
      approved: true,
      commentId: comment.id,
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Unexpected error:', { type: error instanceof Error ? error.name : 'unknown' })
    return new Response(
      JSON.stringify({
        error: 'An unexpected error occurred. Please try again.',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
