# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Dev server (Vite) at localhost:5173
npm run build        # TypeScript check + production build
npm run lint         # ESLint
npm test             # Vitest in watch mode
npm run test:run     # Single test run
npm run test:e2e     # Playwright end-to-end tests
npm run test:e2e:ui  # Playwright with UI
```

### Supabase

```bash
supabase db push                              # Apply migrations to remote database
supabase functions deploy moderate-comment    # Deploy Edge Function
supabase functions serve                      # Run Edge Functions locally
```

### Running a Single Test

```bash
npm test -- src/components/blog-feed/__tests__/BlogPostCard.test.tsx  # Single file
npm test -- -t "test name"                                             # By test name
npx playwright test tests/example.spec.ts                              # Single e2e test
```

## Architecture

### Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4 (uses CSS `@theme` blocks in `src/index.css`, no tailwind.config.js)
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions, Storage)
- **Testing**: Vitest + React Testing Library, Playwright (e2e)
- **Icons**: Lucide React

### Design System

- **Primary**: Violet palette (`--color-primary-*`)
- **Secondary**: Indigo palette (`--color-secondary-*`)
- **Neutral**: Slate palette
- **Fonts**: Space Grotesk (headings), Optima (body), JetBrains Mono (code)
- **Dark mode**: Class-based via `.dark` class

### Project Structure

```
src/
├── components/
│   ├── blog-feed/       # Blog listing (BlogFeed, BlogPostCard)
│   ├── blog-post/       # Post detail + comments (BlogPostView, CommentThread, CommentForm)
│   ├── notifications/   # Notification components
│   ├── settings/        # Settings UI (AppearanceSettings, ReadingSettings)
│   ├── submissions/     # Submission editor (SubmissionEditor, TagSelector, ImageUploader)
│   └── shell/           # App layout (AppShell, MainNav, UserMenu)
├── hooks/               # Custom hooks (useAuth, useComments, useSubmissions, useNotifications, etc.)
├── lib/
│   ├── queries/         # Supabase query functions (blog.ts, comments.ts, submissions.ts, notifications.ts)
│   ├── supabase.ts      # Supabase client
│   └── moderationService.ts  # Comment moderation API
├── pages/               # Route components
├── types/               # TypeScript type definitions
└── router.tsx           # React Router configuration

supabase/
├── functions/
│   └── moderate-comment/   # AI moderation Edge Function (Deno)
├── migrations/             # Database migrations (001-012)
└── seed.sql                # Sample data
```

### Routing

All authenticated routes are under `/kbw-notes/*` prefix:
- `/` - Login page (unauthenticated)
- `/kbw-notes/home` - Blog feed (reads from `submissions` table)
- `/kbw-notes/post/:id` - Single post view with comments
- `/kbw-notes/submissions/*` - Draft management
- `/kbw-notes/profile`, `/kbw-notes/settings`, `/kbw-notes/notifications`

### Key Data Flows

**Authentication Flow:**
1. User visits `/login` → `LoginPage` with Sign In / Sign Up tabs
2. Email validated client-side: must be `@kbw.vc` domain
3. Sign Up: `useAuth.signUp()` → `supabase.auth.signUp()` creates account
4. Sign In: `useAuth.signInWithPassword()` → `supabase.auth.signInWithPassword()`
5. Password Reset: `useAuth.resetPassword()` → sends reset email
6. On success, `onAuthStateChange` listener updates state, triggers redirect

**Comment Moderation Flow:**
1. User submits comment via `CommentForm`
2. `useComments` hook calls `moderationService.submitCommentForModeration()`
3. Request hits Supabase Edge Function `moderate-comment`
4. Edge Function validates request (CORS, Content-Type, rate limit, post exists)
5. Claude API moderates content
6. If approved, comment is inserted with `is_moderated: true`
7. Frontend fetches and displays the new comment

**Submission Draft Flow:**
1. User creates/edits submission in `SubmissionDetailPage`
2. `useSubmissionDraft` hook auto-saves every 30 seconds
3. Draft persisted to `submissions` table with `status: 'draft'`
4. On publish, status changes to `'published'`

**Image Upload Flow:**
1. `ImageUploader` component accepts file
2. `useImageUpload` hook validates MIME type AND magic numbers (prevents spoofing)
3. Uploads to Supabase Storage `post-images` bucket
4. Returns public URL for embedding

### Database Tables

- `profiles` - User profiles (extends Supabase auth.users)
- `blog_posts` - Legacy blog content (not used by home page)
- `submissions` - User-authored blog drafts and published posts (home page reads from here)
- `comments` - Nested comments with `parent_id` for replies, `is_moderated` flag
- `comment_likes` - User likes on comments (unique per user/comment)
- `post_likes` / `post_bookmarks` - User engagement tracking
- `notifications` - User notifications with realtime support
- `rate_limits` - Persistent rate limiting for Edge Functions

### Security Model

The Edge Function (`moderate-comment`) implements multiple security layers:
- **CORS**: Restricted to allowed origins only
- **CSRF**: Requires `Content-Type: application/json`
- **Rate Limiting**: Database-backed, 10 requests/minute per IP
- **Input Validation**: Zod schemas for request/response
- **Unicode Normalization**: NFKC to prevent homograph attacks
- **Post Validation**: Verifies post exists before inserting comment

Client-side security:
- **XSS Prevention**: DOMPurify sanitizes HTML in submission preview
- **Image Validation**: Magic number checks prevent malicious file uploads
- **localStorage Validation**: Settings validated with allowlists before use
- **Authorization**: `deleteComment` verifies ownership before soft-delete
- **Auth Domain Lock**: Only `@kbw.vc` emails can register/sign in

### Settings Persistence

- Appearance settings (theme, font size, density) → `localStorage` key: `kbw-appearance-settings`
- Reading settings (sort, posts per page) → `localStorage` key: `kbw-reading-settings`
- Theme also applies `.dark` class to `document.documentElement`

## Environment Variables

Required in `.env.local`:
```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

Edge Function secrets (set via Supabase dashboard):
- `ANTHROPIC_API_KEY` (or `ClaudeCode`) - Anthropic API key for comment moderation

## Planning Documents

- `ROADMAP.md` - Feature roadmap with planned features across phases
- `PRD.md` - Comprehensive product requirements document
- `TODO.md` - Task tracking
