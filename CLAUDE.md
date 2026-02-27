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
supabase gen types typescript --project-id <ref> > src/lib/database.types.ts  # Regenerate DB types
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
- **Rich Text Editor**: TipTap (for submission content editing)

### 3-Tier Layer Architecture

```
lib/queries/   →   hooks/   →   pages/
(Supabase calls)   (stateful)   (route components)
```

- **Query layer** (`src/lib/queries/`): Pure Supabase calls. No React state. Returns typed data.
- **Hook layer** (`src/hooks/`): Stateful React hooks that call query functions. Manage loading/error states, optimistic updates, side effects.
- **Page layer** (`src/pages/`): Route components that compose hooks and render UI via components.

Components in `src/components/` are presentational — they receive data via props from pages, not directly from hooks or queries.

### Auth Architecture

Auth uses React Context, not scattered hooks:

- `AuthProvider` in `src/contexts/AuthContext.tsx` — wraps the app, maintains a single `onAuthStateChange` subscription shared by all consumers
- `useAuth` hook (`src/hooks/useAuth.ts`) — thin wrapper that reads from AuthContext
- `KbwNotesLayout` (`src/components/auth/KbwNotesLayout.tsx`) — wraps all `/kbw-notes/*` routes, contains `ProtectedRoute` which redirects unauthenticated users to `/`
- Domain lock: only `@kbw.vc` emails can register/sign in (validated via NFKC normalization + strict regex)

### Routing

All authenticated routes are nested under `/kbw-notes` in `src/router.tsx`, wrapped by `KbwNotesLayout`:

- `/` — Login page (unauthenticated)
- `/kbw-notes` — Redirects to `/kbw-notes/home` (index route)
- `/kbw-notes/home` — Blog feed (reads from `submissions` table, NOT `blog_posts`)
- `/kbw-notes/post/:id` — Single post view with comments
- `/kbw-notes/submissions` — Draft listing
- `/kbw-notes/submissions/new` — Create new submission
- `/kbw-notes/submissions/:id` — Edit existing submission
- `/kbw-notes/profile` — User profile
- `/kbw-notes/profile/setup` — Profile setup (first-time users)
- `/kbw-notes/settings` — User settings
- `/kbw-notes/notifications` — Notifications
- `*` — 404 catch-all

All navigation paths from `AppShell` and `UserMenu` must use the `/kbw-notes/` prefix.

### Design System

- **Primary**: Violet palette (`--color-primary-*`)
- **Secondary**: Indigo palette (`--color-secondary-*`)
- **Neutral**: Slate palette
- **Fonts**: Space Grotesk (headings via `var(--font-heading)`), Optima (body via `var(--font-body)`), JetBrains Mono (code)
- **Dark mode**: Class-based via `.dark` class on `document.documentElement`
- **Density**: CSS vars `--density-py`/`--density-gap` set by `.density-*` classes
- **Theme control**: `useSettings` hook is the single source of truth — supports light/dark/system modes, `resolvedTheme` for computed value, `toggleTheme` for switching

### Key Data Flows

**Comment Moderation Flow:**
1. User submits comment via `CommentForm`
2. `useComments` hook calls `moderationService.submitCommentForModeration()`
3. Request hits Supabase Edge Function `moderate-comment`
4. Edge Function validates (CORS, Content-Type, rate limit via `cf-connecting-ip`, post exists)
5. Claude API moderates content
6. If approved, comment inserted with `is_moderated: true`
7. `fetchCommentsForPost` filters by `is_moderated = true` — unmoderated comments are never shown to other users

**Submission Draft Flow:**
1. User creates/edits in `SubmissionDetailPage`
2. `useSubmissionDraft` hook auto-saves every 30 seconds
3. Draft persisted to `submissions` table with `status: 'draft'`
4. On publish, status changes to `'published'`

**Image Upload Flow:**
1. `ImageUploader` accepts file
2. `useImageUpload` validates MIME type AND magic numbers (prevents spoofing)
3. File extension derived from validated MIME type (not user-controlled filename)
4. Uploads to Supabase Storage `post-images` bucket

### Database

**Active tables:**
- `submissions` — Blog drafts and published posts (the home feed reads from here)
- `comments` — Nested comments with `parent_id` for replies, `is_moderated` flag
- `comment_likes` — User likes on comments (unique per user/comment)
- `post_likes` / `post_bookmarks` — User engagement (FK → `submissions` with CASCADE)
- `profiles` — User profiles (extends Supabase auth.users)
- `notifications` — User notifications with realtime support
- `rate_limits` — Persistent rate limiting for Edge Functions

**Legacy (do not use):**
- `blog_posts` — Superseded by `submissions` table

**Types:** `src/lib/database.types.ts` is auto-generated via `supabase gen types`. Do NOT manually edit. Convenience aliases (`Profile`, `CommentRow`, `SubmissionRow`, `NotificationRow`) are exported from this file.

**Migrations:** `supabase/migrations/` contains migrations 001-015.

### Security Model

Edge Function (`moderate-comment`):
- CORS restricted to allowed origins
- CSRF via `Content-Type: application/json` requirement
- Rate limiting: database-backed, 10/min per IP (prefers `cf-connecting-ip` over spoofable headers)
- Input validation: Zod schemas
- Unicode normalization: NFKC to prevent homograph attacks

Client-side:
- XSS: DOMPurify sanitizes TipTap HTML in submission preview and blog post rendering
- Image validation: magic number checks
- localStorage: settings validated with allowlists
- Comment deletion: atomic ownership check in UPDATE query (prevents TOCTOU)
- Profile updates: `supabase.auth.getUser()` verified before mutation

## Testing Patterns

Vitest mock pattern for Supabase: use `vi.hoisted()` to define mocks, not top-level `const` + `vi.mock`. Example:

```typescript
const mockSupabase = vi.hoisted(() => ({
  auth: { getUser: vi.fn(), signUp: vi.fn(), /* ... */ },
  from: vi.fn(),
}))

vi.mock('../lib/supabase', () => ({ supabase: mockSupabase }))
```

Tests live alongside source in `__tests__/` directories. 111 tests across 9 files covering auth validation, hooks, moderation, protected routes, and blog feed.

## Environment Variables

Required in `.env.local`:
```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

Edge Function secrets (set via Supabase dashboard):
- `ANTHROPIC_API_KEY` — Anthropic API key for comment moderation
