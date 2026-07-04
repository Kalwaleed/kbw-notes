# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Design Handoff Folder

`kbw-notes/Handoff_from_design_agent/` is the drop zone for website designs and any other HTML for this project.

Protocol:
1. **Read first** — at the start of a task, read everything in this folder for new input and use it to drive the work.
2. **Cleanup gate** — delete the folder's contents ONLY after PK and I both agree the task is done. No unilateral or preemptive wipes. Confirm explicitly and state what's being removed before deleting.
3. **Fresh start** — an empty folder means a clean slate for the next handoff.

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
supabase db push                                        # Apply migrations to remote database
supabase functions deploy moderate-comment              # Deploy moderation Edge Function
supabase functions deploy submit-reader-submission      # Deploy public reader-submission intake
supabase functions serve                                # Run Edge Functions locally
supabase gen types typescript --project-id <ref> > src/lib/database.types.ts  # Regenerate DB types
```

### Local Supabase (for authenticated e2e + offline dev)

```bash
supabase start --exclude edge-runtime          # Start local stack (skip edge runtime, see caveat)
eval "$(supabase status -o env)"               # Export SUPABASE_URL, ANON_KEY, SERVICE_ROLE_KEY
SUPABASE_SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY \
  node scripts/seed-local.mjs                  # Creates k@kbw.vc (admin) + e2e-author@kbw.vc
supabase status                                # Print URLs + keys
supabase stop                                  # Tear down
```

Local URLs (default ports):
- API:     `http://127.0.0.1:54321`
- DB:      `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
- Studio:  `http://127.0.0.1:54323`
- Mailpit: `http://127.0.0.1:54324` (captures auth emails)

**Caveat — edge-runtime is currently excluded** because Supabase's local edge-runtime image fetches `https://deno.land/std/...` on boot, and intermittent deno.land outages cause exit 143 with no useful error. Auth/RLS/PostgREST tests run fine without it; tests that need `submit-reader-submission` or `moderate-comment` should mock the call or run against the deployed project instead.

Local default keys are deterministic but NOT committed — pull them via `supabase status -o env`. They are the same on every Supabase install (not usable against your production project) but GitHub's secret scanner blocks pushes that contain the literal values, so we keep them out of source.

Test fixtures:
- `k@kbw.vc` — admin (`raw_app_meta_data.role = 'admin'`)
- `e2e-author@kbw.vc` — regular author
- Password (both): `e2e-local-test-password`

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

Entry to KBW Notes is a **single password on the static landing page**. There are no user
accounts, no magic links, no invite gating, and no anonymous Supabase sessions (all torn
out in Phase 2b, migration `20260704150000_remove_invite_machinery`):

- `public/landing.js` checks the password client-side and sets `localStorage['kbw-gate-passed']`.
- `GateGuard` (`src/components/GateGuard.tsx`) wraps `/kbw-notes/*` and redirects to `/` when the flag is missing.
- **The gate is soft**: the password ships in the JS bundle and the flag is settable via devtools. Accepted MVP risk envelope; the server-side upgrade (Vercel middleware + signed cookie) sits in the `HANDOFF.md` backlog.
- The browser has **no write access** to the database or storage. All anonymous writes go through service-role Edge Functions (`moderate-comment`, `submit-reader-submission`) with per-IP rate limiting.
- `AuthProvider` (`src/contexts/AuthContext.tsx`) and `useAuth` remain in the codebase only for future internal/admin capabilities; no route renders authenticated UI today. Keep RLS write protections in place before reintroducing any.
- Admin role (future use) lives in `auth.users.raw_app_meta_data.role = 'admin'`; bootstrapped to `k@kbw.vc`.
- `auth_audit` is retained as a historical log from the magic-link era; `hook_restrict_email_domain(jsonb)` still exists in the DB (dashboard hook disabled 2026-07-04) and can now be dropped.

### Routing

Public reader routes are defined in `src/router.tsx`:

- `/` — Static landing page with the password popover (separate Vite input, not the SPA)
- `/kbw-notes` — Redirects to `/kbw-notes/home` (index route)
- `/kbw-notes/home` — Blog feed (reads from `submissions` table, NOT `blog_posts`)
- `/kbw-notes/post/:id` — Single post view with comments
- `/kbw-notes/submissions` — Anonymous public draft intake
- `/kbw-notes/settings` — Anonymous local reading/appearance preferences
- `*` — 404 catch-all

Identity, notification, profile, and submission-management/admin pages are not exposed in routing or navigation. Public submissions write to `reader_submissions` through `submit_reader_submission(...)`; they do not publish content or grant edit access. Keep database RLS write protections in place before reintroducing any authenticated UI.

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
- `rate_limits` — Persistent rate limiting for Edge Functions (atomic via `rate_limit_increment` RPC)
- `reader_submissions` — Public intake drafts (via `submit_reader_submission` RPC; text sanitized server-side)
- `auth_audit` — Historical sign-in attempt log from the magic-link era (retained, unused)

**Legacy (do not use):**
- `blog_posts` — Superseded by `submissions` table

**Types:** `src/lib/database.types.ts` is auto-generated via `supabase gen types`. Do NOT manually edit. Convenience aliases (`Profile`, `CommentRow`, `SubmissionRow`, `NotificationRow`) are exported from this file.

**Migrations:** `supabase/migrations/` — numbered 001-018 plus timestamp-named migrations from 2026-07 onward (latest: `20260704150000_remove_invite_machinery`).

### Security Model

Edge Functions:
- `moderate-comment` — Claude-backed comment moderation. CORS restricted to allowed origins. CSRF via `Content-Type: application/json`. Rate limiting: database-backed, 10/min per IP (prefers `cf-connecting-ip` over spoofable headers). Input validation via Zod. NFKC Unicode normalization to prevent homograph attacks.
- `submit-reader-submission` — Public reader-draft intake. CORS restricted + `Content-Type: application/json` CSRF guard. Rate limit: 5 per 10 min per IP (`cf-connecting-ip` only, fail-closed). Zod validation. Cover images uploaded server-side with the service role (client has no storage write). All text fields (name, title, excerpt, content, tags) HTML-stripped and entity-encoded via `_shared/sanitize.ts` before the `submit_reader_submission` RPC insert — any future admin review UI must STILL route them through `contentRenderer.ts` before `dangerouslySetInnerHTML`.

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
