# KBW Notes — Security Sweep Handoff

Living handoff for the security + cleanup sweep. Update as phases land.

## Auth model (current truth)

Entry to KBW Notes is a **single password on the static landing page** (`public/landing.js`
sets `localStorage['kbw-gate-passed']`; `GateGuard` checks it). There are **no user
accounts, no magic links, no `@kbw.vc` gating, no anonymous Supabase sessions**. The
reader app is public behind the gate; comment posting and reader submissions run through
service-role Edge Functions.

> The landing gate is client-side (password in the JS bundle, flag bypassable via devtools).
> Making it a real server-side gate is a separate, unstarted piece — see Backlog.

## Status by phase

### Phase 0/1/2-core — DEPLOYED & LIVE-VERIFIED (commit `1cf65d7`)
| Item | What | Live check |
|---|---|---|
| #1 CRITICAL | submissions INSERT → authenticated + non-anon + draft-only | anon published-insert rejected (`42501`) |
| #2 HIGH | `submit-reader-submission` edge fn, rate-limited 5/10min per IP | direct RPC → `permission denied`; guards 403/415/400 pass |
| #3 HIGH | cover uploads server-side; anon sessions + client storage-write policies removed | anon upload → RLS reject |
| #4 MED | comment sandboxed in `<user_comment>` block vs prompt injection | deployed (no-change confirm) |
| #6 LOW | dropped stray `ClaudeCode` API-key fallback | deployed |
| BUG | real `comment_likes(count)` + hydrate viewer liked-state | query valid vs prod schema |
| PERF | memoized AuthContext value | deployed |

### Phase 2b — STAGED, NOT DEPLOYED (this commit)
Removed the dead magic-link / `@kbw.vc` / invite machinery:
- `AuthContext`: removed `requestMagicLink`, `isEmailAllowed`, `ALLOWED_DOMAIN`, `AuthResult`.
- Deleted `src/pages/RejectedPage.tsx` + `/rejected` route; `src/lib/queries/invites.ts`.
- Deleted Edge Functions `request-magic-link/` and `auto-sign-in/` (source) + `config.toml` entries.
- Migration `20260704150000_remove_invite_machinery.sql`: `drop table invited_emails cascade`.
- Tests updated (AuthContext, useAuth, router). Build clean, 168/168 pass.

## Deploy — Phase 2b (PK runs; agent can't push to prod)

```bash
cd .../kbw-blog/kbw-notes
supabase db push                              # applies 20260704150000_remove_invite_machinery
supabase functions delete request-magic-link  # remove the deployed (now-sourceless) function
supabase functions delete auto-sign-in
vercel --prod                                 # ship the client teardown
```

### Manual dashboard steps (do these too)
1. **Auth > Hooks** → disable the **Before User Created** hook (`hook_restrict_email_domain`).
   Only after it's disabled is it safe to `drop function public.hook_restrict_email_domain(jsonb)`
   (left in place by the migration on purpose).
2. **Auth > Providers > Anonymous** → **disable** anonymous sign-ins (client no longer uses them;
   this closes the API-level path entirely).

## Verify after deploy
- Signed-out `insert` into `submissions` still rejected (already true).
- `/kbw-notes/*` still loads behind the landing password; `/rejected` now 404s.
- Submit a post w/ cover image → succeeds (server-side upload).
- Post a comment → still moderated + visible; like count survives reload.

### Phase 3 — #5 MED + LOW batch — STAGED, NOT DEPLOYED
Commits `9828a96`..`b8b7660` (build clean, 179/179 tests, lint 0 errors):
- **#5 MED** — intake sanitization (details below).
- **LOW** — explicit column lists replace `select('*')` in `submissions.ts`/`editions.ts`;
  `useSubmissionDraft` now flushes dirty edits on unmount (was silently dropping ≤30s);
  route-level code splitting + vendor chunks (app entry 556 KB → ~9 KB, react/supabase
  vendors cached separately; smoke-tested all routes in-browser); Tailwind source scanning
  scoped to `src/` — kills the `[file\:line]` esbuild warning and 6 KB of junk CSS.

#### #5 MED sanitization detail
`submit-reader-submission` now strips HTML (script/style blocks + tags, loop-until-stable)
and entity-encodes the remainder of `submitter_name`, `title`, `excerpt`, `content`, and
each tag before the RPC insert. Helper: `supabase/functions/_shared/sanitize.ts` (Deno-side,
dependency-free), unit-tested from `src/lib/__tests__/readerSubmissionSanitize.test.ts`.

> **Hard rule for any future admin review UI:** `reader_submissions.*` MUST still go through
> `src/lib/content/contentRenderer.ts` (`sanitizeForStorage`/`sanitizeForArticle`) before any
> `dangerouslySetInnerHTML`. The intake-side strip is defense-in-depth, not a substitute.

Post-deploy live check: submit a post containing `<script>alert(1)</script>` and `<b>x</b>`
via the public form; confirm the stored row contains no `<`.

## Deploy — Phase 3 (PK runs, after or with Phase 2b)

```bash
cd .../kbw-blog/kbw-notes
supabase functions deploy submit-reader-submission  # picks up _shared/sanitize.ts
vercel --prod                                       # client: code-split bundle + draft flush
```

Live check: submit via the public form with `<script>alert(1)</script><b>x</b>` in the body →
stored row must contain no `<`.

## Backlog (not started)
- Update project `CLAUDE.md` "Auth Architecture" section to describe the password-gate model
  (currently still documents magic-link/invite).
- Optional: server-side landing gate (Vercel middleware + signed cookie) per the old
  `phase-2-real-gate-plan.md`.

## One-off cleanup
- Delete the smoke-test row in `reader_submissions`: title `SMOKE TEST - please delete`,
  id `a9ef1bbb-77c9-4501-8657-f236fe6be57d`.
