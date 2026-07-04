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

### Phase 2b — DEPLOYED & CLOSED 2026-07-04
Removed the dead magic-link / `@kbw.vc` / invite machinery:
- `AuthContext`: removed `requestMagicLink`, `isEmailAllowed`, `ALLOWED_DOMAIN`, `AuthResult`.
- Deleted `src/pages/RejectedPage.tsx` + `/rejected` route; `src/lib/queries/invites.ts`.
- Deleted Edge Functions `request-magic-link/` and `auto-sign-in/` (source) + `config.toml` entries.
- Migration `20260704150000_remove_invite_machinery.sql`: `drop table invited_emails cascade`.
- Tests updated (AuthContext, useAuth, router). Build clean, 168/168 pass.

Deployed by PK 2026-07-04: migration pushed, `request-magic-link` + `auto-sign-in` deleted,
client shipped via `vercel --prod` (aliased to kalwaleed.com).

### Manual dashboard steps — DONE 2026-07-04 (both toggles disabled by PK)
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

### Phase 3 — #5 MED + LOW batch — DEPLOYED 2026-07-04 & LIVE-VERIFIED
Commits `9828a96`..`aea8d50` (build clean, 181/181 tests, lint 0 errors; CodeRabbit-reviewed,
both findings fixed — in-flight-save unmount race + sanitizer perf regression test):
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

**Live-verified 2026-07-04:** POSTed a payload with `<script>` blocks, `<b>`/`<i>` tags, an
unclosed `<img onerror=...>`, and stray specials to the deployed function — stored row
contained zero `<` (scripts removed with content, tags stripped, leftovers entity-encoded),
status `pending`. Smoke row deleted afterwards; the older `a9ef1bbb` smoke row was already gone.

### Phase 4 — Weekly AI-Adoption Self-Reports — BUILT, NOT DEPLOYED (2026-07-04)
Staff file the mandate's weekly self-report at `/kbw-notes/report`; Donya reviews at
`/kbw-notes/report/review`. Real Supabase accounts (login-only UI, no signup/reset),
`is_reviewer()` role via app_metadata, additive-only migration `20260704190000_self_reports`
(self_reports + self_report_reviews; reviews RLS-hidden from staff; JSONB shape-checked;
no DELETE policies — comp evidence survives). Thresholds live in ONE module:
`src/lib/self-reports/thresholds.ts`. Drafts persist in localStorage until the server
confirms. Routes sit OUTSIDE GateGuard (session > soft gate). NO equity/comp fields —
comp decisions go through counsel, not this DB.

Verified: 213 unit tests; 13/13 RLS integration checks vs local Postgres (forgery blocked,
reviews invisible to staff, JSONB junk rejected, no deletes, upsert = same row + fresh
submitted_at); 6/6 headless UI smoke (login → submit → reviewer sees → saves review;
staff blocked from reviewer page). Local fixtures: `e2e-reviewer@kbw.vc` /
`e2e-staff@kbw.vc` in `scripts/seed-local.mjs`.

#### Deploy — Phase 4 (PK runs)
```bash
cd .../kbw-blog/kbw-notes
supabase db push     # applies 20260704190000_self_reports
vercel --prod
```

#### BEFORE inviting staff — SMTP check (one-time)
Dashboard → Project Settings → Auth → SMTP. If custom SMTP is NOT configured, invite
emails + password resets use Supabase's built-in mailer (rate-limited to a few per hour,
spam-prone) — configure an SMTP provider first or the 15-invite batch will stall and PK
becomes the manual reset path.

#### Staff provisioning checklist (~15 accounts, one-time, dashboard)
1. Auth → Users → Invite user — email ONLY. Do NOT set name metadata (the profiles
   trigger would publish real names on the public site; without it they store 'Anonymous').
2. Donya: after her user exists, set app metadata to `{"role":"reviewer"}`
   (Auth → Users → her user → edit App Metadata). Staff get NO role. PK (k@kbw.vc) is
   already admin and can see reports + write reviews.
3. Share URLs: staff → `https://kalwaleed.com/kbw-notes/report` · Donya →
   `https://kalwaleed.com/kbw-notes/report/review`. Sign-in is email + the password they
   set from the invite email.
4. Post-deploy spot check: submit from one test account; confirm Donya sees it and the
   staff account cannot open the review page.

#### Rollback (never DROP the tables — comp evidence)
Backup first: `pg_dump "$DB_URL" -t public.self_reports -t public.self_report_reviews
--data-only --column-inserts > self_reports_backup.sql`. Then: drop the staff
INSERT/UPDATE policies (data stays readable), ban the staff users in the dashboard,
`vercel rollback`. Sign-ins are natively logged in dashboard Auth logs.

## Backlog (not started)
- Optional: server-side landing gate (Vercel middleware + signed cookie) per the old
  `phase-2-real-gate-plan.md`.
- Optional: `drop function public.hook_restrict_email_domain(jsonb)` — safe now that the
  dashboard hook is disabled (2026-07-04).
- Phase 4 fast-follow (after week-1 reports land): PK's Day-30/Day-60 KPI rollup view
  (per-staff On Track / At Risk vs `thresholds.ts`), missed-submission list for Donya.
- Phase 4 known-accepted: staff JWTs can like/comment on the public blog under their
  account (ownership-scoped, display_name stays 'Anonymous'); no email reminders (no SMTP
  automation yet).

## One-off cleanup
- ~~Delete the smoke-test row in `reader_submissions` (`a9ef1bbb-...`)~~ — done; row was
  already absent when checked 2026-07-04.
- Push `main` to `origin` (local was 9+ commits ahead after Phase 3).
