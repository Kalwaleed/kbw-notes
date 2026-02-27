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
const MODERATION_SYSTEM_PROMPT = `You are a content moderation system for a professional tech blog. Your job is to evaluate user comments and determine if they should be approved or rejected.

REJECT comments that contain ANY of the following:
1. HATE SPEECH: Slurs, discrimination, or attacks based on race, ethnicity, religion, gender, sexual orientation, disability, or national origin
2. HARASSMENT: Personal attacks, bullying, threats, intimidation, or doxxing
3. PROFANITY: Vulgar language, obscenities, or crude sexual references
4. EXPLICIT CONTENT: Sexual content, graphic violence, or gore
5. SPAM: Promotional content, irrelevant links, repetitive text, or gibberish
6. MISINFORMATION: Dangerous medical/legal advice presented as fact
7. ILLEGAL CONTENT: Content promoting illegal activities

APPROVE comments that are:
- Constructive criticism (even if negative)
- Technical discussions
- Questions and clarifications
- Polite disagreements
- On-topic conversations

Respond ONLY with a JSON object in this exact format:
{
  "approved": boolean,
  "category": "approved" | "hate_speech" | "harassment" | "profanity" | "explicit" | "spam" | "misinformation" | "illegal",
  "reason": "A clear, specific explanation (2-3 sentences) of why the comment was rejected, written directly to the user. If approved, set to null."
}

Be STRICT but FAIR. When in doubt about borderline cases, lean toward rejection for safety.`

// Rate limit configuration
const RATE_LIMIT = 10 // comments per minute
const RATE_WINDOW_MS = 60 * 1000 // 1 minute

// Get client IP for rate limiting
// Prefer cf-connecting-ip (Cloudflare-verified, not spoofable) over user-controllable headers
function getClientIP(req: Request): string {
  const cfIP = req.headers.get('cf-connecting-ip')
  if (cfIP) {
    return cfIP
  }
  const realIP = req.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return 'unknown'
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

// Check rate limit using database (persistent across function instances)
async function checkRateLimit(
  supabaseAdmin: ReturnType<typeof createClient>,
  identifier: string
): Promise<boolean> {
  const now = new Date()
  const windowStart = new Date(now.getTime() - RATE_WINDOW_MS)

  // Check existing rate limit record
  const { data: existing } = await supabaseAdmin
    .from('rate_limits')
    .select('*')
    .eq('identifier', identifier)
    .single()

  if (!existing) {
    // Create new record
    await supabaseAdmin.from('rate_limits').insert({
      identifier,
      count: 1,
      window_start: now.toISOString(),
    })
    return true
  }

  const windowStartTime = new Date(existing.window_start)
  if (windowStartTime < windowStart) {
    // Window expired, reset
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

  // Increment count
  await supabaseAdmin
    .from('rate_limits')
    .update({ count: existing.count + 1 })
    .eq('identifier', identifier)

  return true
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

    // Check rate limit (using persistent database storage)
    const allowed = await checkRateLimit(supabaseAdmin, clientIP)
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

    // Call Anthropic API for moderation
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY') || Deno.env.get('ClaudeCode')
    if (!anthropicApiKey) {
      return new Response(
        JSON.stringify({ error: 'Moderation service unavailable' }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
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
    })

    if (!anthropicResponse.ok) {
      // Log status only, not response body (to avoid leaking sensitive data)
      console.error('Anthropic API error:', {
        status: anthropicResponse.status,
        statusText: anthropicResponse.statusText,
      })
      return new Response(
        JSON.stringify({
          error: 'Moderation service error. Please try again.',
        }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const anthropicData = await anthropicResponse.json()
    const moderationText = anthropicData.content[0].text

    // Parse and validate moderation result with Zod
    let moderationResult: z.infer<typeof ModerationResultSchema>
    try {
      const parsed = JSON.parse(moderationText)
      const validated = ModerationResultSchema.safeParse(parsed)

      if (!validated.success) {
        // Log validation error (not the full response)
        console.error('Invalid moderation response schema')
        moderationResult = {
          approved: false,
          category: 'error',
          reason:
            'Unable to verify content. Please try again or contact support.',
        }
      } else {
        moderationResult = validated.data
      }
    } catch {
      moderationResult = {
        approved: false,
        category: 'error',
        reason:
          'Unable to verify content. Please try again or contact support.',
      }
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
