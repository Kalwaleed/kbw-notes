# External Integrations

**Analysis Date:** 2026-01-25

## APIs & External Services

**Comment Moderation:**
- Anthropic Claude API (v1) - AI-powered comment content moderation
  - SDK/Client: Native `fetch` via Edge Function
  - Endpoint: `https://api.anthropic.com/v1/messages`
  - Model: `claude-3-haiku-20240307` (cost-optimized for real-time moderation)
  - Auth: `ClaudeCode` API key stored in Supabase Edge Function secrets
  - Used by: `supabase/functions/moderate-comment/index.ts` (Deno/Edge Function)

## Data Storage

**Databases:**
- PostgreSQL via Supabase
  - Connection: `VITE_SUPABASE_URL` environment variable
  - Client: `@supabase/supabase-js` 2.90.1
  - Tables:
    - `profiles` - User profiles extending Supabase auth.users
    - `blog_posts` - Blog content with authors and metadata
    - `comments` - Nested comments with moderation flag
    - `post_likes` - User engagement tracking
    - `post_bookmarks` - User engagement tracking
    - `submissions` - User blog post submissions (see `006_submissions_table.sql`)
    - `notifications` - User notifications (see `007_notifications_table.sql`)
  - Migrations: `supabase/migrations/001_initial_schema.sql` through `007_notifications_table.sql`

**File Storage:**
- Not implemented (no file storage integrations detected)
- Image uploads mentioned in `src/hooks/useImageUpload.ts` but implementation not yet integrated

**Caching:**
- Browser localStorage only
  - `kbw-appearance-settings` - Theme, font size, density preferences
  - `kbw-reading-settings` - Sort order, posts per page
- No server-side caching (Redis, Memcached, etc.)

**Realtime:**
- Supabase Realtime - Real-time subscriptions for live updates
  - Used for post like counts and bookmark syncing across clients
  - Configured via `@supabase/supabase-js` client

## Authentication & Identity

**Auth Provider:**
- Supabase Auth (built-in PostgreSQL-backed)
  - Implementation: Email/password authentication (currently hibernated for easier testing)
  - User profiles extend `auth.users` table via `profiles` table with UUID foreign key
  - Anonymous commenting enabled (user_id can be null in comments)
  - Session management via Supabase client

## Monitoring & Observability

**Error Tracking:**
- Not implemented
- No Sentry, Rollbar, or similar integration detected

**Logs:**
- Console logging only (`console.log`, `console.error`)
- Edge Function logs available via Supabase dashboard
- Development: Browser DevTools console

**Structured Logging:**
- Not implemented; ad-hoc `console.log()` calls throughout codebase
- Example: `[moderationService]` prefix in `src/lib/moderationService.ts` for context

## CI/CD & Deployment

**Hosting:**
- Static deployment target (Vercel, Netlify, etc.)
- SPA (Single Page Application) with Vite build output in `dist/`

**CI Pipeline:**
- Not configured (no GitHub Actions, GitLab CI, etc. detected)
- Manual build command: `npm run build` (TypeScript check + Vite build)

**Edge Functions Deployment:**
- Supabase Edge Functions
- Deploy via: `supabase functions deploy moderate-comment`
- Serve locally: `supabase functions serve`
- Deployed at: Supabase-provided URL, invoked via `supabase.functions.invoke('moderate-comment')`

## Environment Configuration

**Required env vars:**
- `VITE_SUPABASE_URL` - Supabase project URL (e.g., `https://<project-ref>.supabase.co`)
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous public API key

**Supabase Edge Function Secrets:**
- `ClaudeCode` - Anthropic API key for comment moderation

**Secrets location:**
- Frontend: `.env.local` file (Git-ignored)
- Backend: Supabase dashboard → Project Settings → Secrets (for Edge Functions)
- Template: `.env.example` in repository root

## Webhooks & Callbacks

**Incoming:**
- Not implemented (no webhook ingestion points detected)

**Outgoing:**
- Not implemented
- Could be added via Supabase Edge Functions in future

## Data Flows & API Calls

**Comment Submission Flow:**
1. User submits comment via `CommentForm` component
2. `useComments` hook calls `moderationService.submitCommentForModeration()`
3. Frontend invokes Edge Function: `supabase.functions.invoke('moderate-comment', { body: { postId, content, parentId } })`
4. Edge Function fetches `https://api.anthropic.com/v1/messages` with Claude API
5. Claude evaluates content against moderation rules
6. Edge Function either rejects (returns 200 with approved: false) or inserts comment (returns 200 with approved: true + commentId)
7. Frontend displays result or error message

**Blog Post Fetching:**
1. Homepage/feed calls `fetchBlogPosts()` from `src/lib/queries/blog.ts`
2. Supabase client queries `blog_posts` table with cursor-based pagination
3. Joins with `profiles` table to get author info
4. Filters for published posts, orders by publish date descending

**Post Engagement:**
1. User clicks like/bookmark on blog post
2. `usePostEngagement` hook calls `toggleLike()` or `toggleBookmark()`
3. Inserts/deletes row in `post_likes` or `post_bookmarks` table
4. Supabase Realtime updates connected clients
5. Like counts updated in real-time across users

## Rate Limiting

**Comment Submission:**
- In-memory rate limiting by client IP
- Limit: 10 comments per minute per IP
- Enforced in Edge Function `moderate-comment/index.ts`
- Returns 429 status if exceeded

---

*Integration audit: 2026-01-25*
