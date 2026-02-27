# Follow-Up Phases — Remaining Known Gaps

After Phases 1-4, four known issues remain from the audit. None are blocking production, but all introduce either data integrity risk, maintenance burden, or UX inconsistency.

---

## Phase 5: Database Integrity — FK Alignment

### Status: Migration written, NOT applied to remote

Migration `014_fix_fk_references.sql` exists and is committed (Phase 2, commit `3ce159d`), but has not been pushed to the remote Supabase database.

### What it fixes

1. **`post_likes.post_id` FK → `submissions`** (was `blog_posts`)
2. **`post_bookmarks.post_id` FK → `submissions`** (was `blog_posts`)
3. **`comments.post_id` FK re-added → `submissions`** (dropped in migration 004)
4. **`prevent_moderation_status_change` trigger** — adds `SET search_path = ''` for security

### Why it matters

The home feed reads from `submissions`, not `blog_posts`. Without the FK fix, likes/bookmarks/comments have no referential integrity against the table they actually reference. Orphaned rows are possible if a submission is deleted.

### Action required

```bash
supabase db push
```

Verify after push:
- Like a published post → confirm `post_likes` row references a `submissions` row
- Comment on a post → confirm `comments` row has valid FK
- Delete a submission → confirm cascade deletes associated likes/bookmarks/comments

### Risk

Low. The migration uses `DROP CONSTRAINT IF EXISTS` + `ADD CONSTRAINT`, so it's idempotent. Existing data may fail if any `post_id` values don't exist in `submissions` — check with:

```sql
SELECT pl.id, pl.post_id FROM post_likes pl
  LEFT JOIN submissions s ON s.id = pl.post_id
  WHERE s.id IS NULL;

SELECT pb.id, pb.post_id FROM post_bookmarks pb
  LEFT JOIN submissions s ON s.id = pb.post_id
  WHERE s.id IS NULL;

SELECT c.id, c.post_id FROM comments c
  LEFT JOIN submissions s ON s.id = c.post_id
  WHERE s.id IS NULL;
```

Delete orphans before applying the migration if any are found.

---

## Phase 6: Auto-Generate `database.types.ts`

### Current state

`src/lib/database.types.ts` is manually maintained. It's incomplete — missing `submissions`, `notifications`, `rate_limits`, `comment_likes` tables. The `comments.user_id` is typed as `string` (non-nullable) but the actual schema allows `NULL` for anonymous comments (migration 003/005).

### What to do

```bash
supabase gen types typescript --local > src/lib/database.types.ts
# or against remote:
supabase gen types typescript --project-id <ref> > src/lib/database.types.ts
```

Then update the Supabase client to use the generated types:

```ts
// src/lib/supabase.ts
import type { Database } from './database.types'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

### Impact

- Query return types become accurate (catches bugs at compile time)
- No more manual type maintenance
- `comments.user_id` correctly typed as `string | null`
- New tables (`submissions`, `notifications`, `comment_likes`, `rate_limits`) get type coverage

### Files affected

- `src/lib/database.types.ts` — full replacement
- `src/lib/supabase.ts` — add `Database` generic
- Possibly `src/lib/queries/*.ts` — remove manual `as unknown as` casts if generated types align

---

## Phase 7: Unify Theme System

### Problem

Two independent hooks both control the `.dark` class on `document.documentElement`:

| Hook | localStorage key | Theme values | Used by |
|------|-----------------|-------------|---------|
| `useTheme` | `theme` | `'light' \| 'dark'` | 8 pages (HomePage, LoginPage, ProfilePage, etc.) |
| `useSettings` | `kbw-appearance-settings` | `'light' \| 'dark' \| 'system'` | SettingsPage only |

Both hooks run `useEffect` to toggle `.dark` on the root element. If a user changes theme in Settings (via `useSettings`), then navigates to Home (which uses `useTheme`), the `useTheme` effect runs and may revert the theme to whatever was stored under the `theme` key — overriding the Settings choice.

### Root cause

`useTheme` was the original implementation. `useSettings` was added later with a superset of features (system mode, font size, density) but `useTheme` was never removed from pages.

### Fix

1. Remove `useTheme` hook entirely (`src/hooks/useTheme.ts`)
2. Remove `useTheme` export from `src/hooks/index.ts`
3. In each page that calls `useTheme()`:
   - If the page only called `useTheme()` with no return value (just for side effect) — remove the call entirely. `useSettings` in `SettingsPage` + `App.tsx` handles theme globally.
   - If the page uses `theme` or `toggleTheme` — replace with `useSettings().appearance.theme` and `useSettings().setTheme`
4. Move theme application (`useEffect` toggling `.dark`) into a single top-level component (e.g., `App.tsx` or `KbwNotesLayout.tsx`) that reads from `useSettings`
5. Migrate existing `theme` localStorage key to `kbw-appearance-settings.theme` on first load (one-time migration in `useSettings` init)
6. Remove the `theme` localStorage key after migration

### Pages to update

- `src/pages/HomePage.tsx` — uses `theme`, `toggleTheme`
- `src/pages/LoginPage.tsx` — uses `theme`, `toggleTheme`
- `src/pages/ProfilePage.tsx` — uses `theme`, `toggleTheme`
- `src/pages/ProfileSetupPage.tsx` — uses `theme`, `toggleTheme`
- `src/pages/NotificationsPage.tsx` — uses `theme`, `toggleTheme`
- `src/pages/NewSubmissionPage.tsx` — calls `useTheme()` (no return used)
- `src/pages/SubmissionDetailPage.tsx` — calls `useTheme()` (no return used)
- `src/pages/SubmissionsPage.tsx` — calls `useTheme()` (no return used)

### Risk

Medium. Touching 8 pages and the theme initialization logic. Test manually across light/dark/system modes after the change. Write tests for `useSettings` theme application.

---

## Phase 8: Clean Up `database.types.ts` Imports

### Contingent on Phase 6

Once `database.types.ts` is auto-generated and the Supabase client is typed, audit all query files for:

1. **Remove `as unknown as` casts** — if generated types match expected shapes, direct typing is safer
2. **Remove manual `DbComment` interface** in `src/lib/queries/comments.ts` — replace with generated type
3. **Validate `submissions` query shapes** — `src/lib/queries/submissions.ts` uses `Record<string, unknown>` for transform, which should use the generated `Row` type instead

### Files to audit

- `src/lib/queries/comments.ts` — has manual `DbComment` interface
- `src/lib/queries/submissions.ts` — uses `Record<string, unknown>` in `transformSubmission`
- `src/lib/queries/blog.ts` — check for manual type assertions
- `src/lib/queries/notifications.ts` — check for manual type assertions

---

## Execution Order

```
Phase 5 (DB push)     — independent, can run anytime
Phase 6 (gen types)   — independent, can run anytime (after Phase 5 for accurate types)
Phase 7 (theme unify) — independent, can run anytime
Phase 8 (type cleanup) — depends on Phase 6
```

Phases 5, 6, and 7 have no dependencies on each other and can be done in any order or in parallel.
