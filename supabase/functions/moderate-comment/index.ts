import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

// Types
interface ModerationRequest {
  postId: string
  content: string
  parentId?: string | null
}

interface ModerationResponse {
  approved: boolean
  commentId?: string
  rejectionReason?: string
  category?: string
}

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

// Simple in-memory rate limiting (by IP for anonymous users)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 10  // comments per minute
const RATE_WINDOW = 60 * 1000  // 1 minute

function checkRateLimit(identifier: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(identifier)

  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + RATE_WINDOW })
    return true
  }

  if (limit.count >= RATE_LIMIT) {
    return false
  }

  limit.count++
  return true
}

// Get client IP for rate limiting anonymous users
function getClientIP(req: Request): string {
  // Check various headers for the real IP (when behind proxy/CDN)
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIP = req.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }
  // Fallback
  return 'unknown'
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get client IP for rate limiting
    const clientIP = getClientIP(req)

    // Check rate limit by IP
    if (!checkRateLimit(clientIP)) {
      return new Response(
        JSON.stringify({ error: 'Too many comments. Please wait a moment before trying again.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { postId, content, parentId }: ModerationRequest = await req.json()

    // Validate input
    if (!postId || !content?.trim()) {
      return new Response(
        JSON.stringify({ error: 'postId and content are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (content.length > 2000) {
      return new Response(
        JSON.stringify({ error: 'Comment exceeds maximum length of 2000 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Call Anthropic API for moderation
    const anthropicApiKey = Deno.env.get('ClaudeCode')
    if (!anthropicApiKey) {
      console.error('ClaudeCode API key not configured')
      return new Response(
        JSON.stringify({ error: 'Moderation service unavailable' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
        model: 'claude-3-haiku-20240307',
        max_tokens: 256,
        system: MODERATION_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Evaluate this comment for a tech blog:\n\n"${content.trim()}"`
          }
        ]
      })
    })

    if (!anthropicResponse.ok) {
      console.error('Anthropic API error:', await anthropicResponse.text())
      return new Response(
        JSON.stringify({ error: 'Moderation service error. Please try again.' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const anthropicData = await anthropicResponse.json()
    const moderationText = anthropicData.content[0].text

    // Parse moderation result
    let moderationResult: { approved: boolean; category: string; reason: string | null }
    try {
      moderationResult = JSON.parse(moderationText)
    } catch {
      console.error('Failed to parse moderation response:', moderationText)
      // Default to rejection if we can't parse
      moderationResult = {
        approved: false,
        category: 'error',
        reason: 'Unable to verify content. Please try again or contact support.'
      }
    }

    // If rejected, return immediately with reason
    if (!moderationResult.approved) {
      const response: ModerationResponse = {
        approved: false,
        rejectionReason: moderationResult.reason || 'Your comment was rejected for violating community guidelines.',
        category: moderationResult.category
      }
      return new Response(
        JSON.stringify(response),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If approved, insert the comment using service role for reliability
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: comment, error: insertError } = await supabaseAdmin
      .from('comments')
      .insert({
        post_id: postId,
        user_id: null,  // Anonymous comment
        content: content.trim(),
        parent_id: parentId || null,
        is_moderated: true  // Passed AI moderation
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to save comment. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const response: ModerationResponse = {
      approved: true,
      commentId: comment.id
    }

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
