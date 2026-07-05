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

### Phase 5 — Full-site QA sweep + anonymous engagement — 2026-07-05
Full live audit of kalwaleed.com (gate, feed, post, comments, likes, shares,
settings, submissions, self-reports, mobile). Findings + fixes:

- **FIXED (prod, live) — comment moderation was broken.** `ANTHROPIC_API_KEY`
  was never set as a function secret (only the stray `ClaudeCode` secret existed;
  the code fallback to it was removed in Phase 0/1/2 #6). Every comment since
  hit the degraded path: HTTP 202, inserted `is_moderated=false`, never shown.
  Fixed via `supabase secrets set ANTHROPIC_API_KEY` (same key, digest-matched).
  Live-verified: comment approved end-to-end in ~4s. PK's stuck 'test' comment
  from 07-04 was deleted along with QA smoke rows.
- **BUILT — anonymous engagement (likes + reports).** The public blog had NO
  like UI at all (HomePage never passed `onLike`; PostPage had no post-like
  affordance; comment likes were signed-in-only) because RLS correctly blocks
  anon writes. New device-scoped path mirroring the comment architecture:
  - Migration `20260705093249_anon_engagement` (applied to prod): nullable
    `user_id` + `anon_id` on post_likes/comment_likes (exactly-one-identity
    check, partial unique indexes), `comment_reports` table (service-role
    only), service-role-only RPCs `toggle_post_like_anon` /
    `toggle_comment_like_anon` / `report_comment_anon` (EXECUTE revoked from
    client roles; anon REST call returns 42501 — verified), and
    `notify_on_post_like` now skips anon likes (no actor).
  - Edge Function `public-engagement` (deployed, verify_jwt=false): same
    origin/CSRF/`cf-connecting-ip` guards as moderate-comment, 30 actions/min
    per IP via `rate_limit_increment`. Guards live-verified (403/415/400/404).
  - Client: `kbw-anon-id` UUID in localStorage (`src/lib/anonId.ts`); like
    buttons on feed cards + post page (meta rail + share block); anonymous
    comment likes; Report button now real (was a no-op TODO) with
    optimistic "Reported" state; liked-state hydrates by anon id on load.
  - Threat envelope: same as anonymous comments — localStorage identity is
    best-effort dedupe; per-IP rate limit bounds count inflation. Accepted.
- **FIXED — folio bar overlap on phone widths** (clock now hidden below `sm`,
  left slug truncates).
- **FIXED — `HydrateFallback` console warning** (root route
  `hydrateFallbackElement: <></>`).
- Checked, NOT bugs: header ThemeToggle dark-mode state (correct); self-report
  wipe seen during automation was a test-tooling ref remap, not a product bug
  (form gates on `loading`, drafts persist per keystroke).
- Verified working (no changes needed): landing gate (wrong/right password),
  share intents (X `twitter.com/intent/tweet` → 301 x.com with url+text;
  LinkedIn `share-offsite` → shareArticle with url; NOTHING posted), reader
  submission E2E incl. server-side cover upload + sanitization, staff
  self-report submit → reviewer worklist → review save (temp accounts created
  and deleted), staff blocked from reviewer page, dark mode persistence,
  mobile 375px, 404s.
- **FIXED — Settings → Reading controls were dead** (persisted to localStorage,
  consumed by nothing). Now wired: Default Sort (newest/oldest server-side via
  cursor direction; popular sorts a bounded 60-post window by like count —
  documented cap, revisit with a like-count view if the archive outgrows it),
  Posts per Page (feed limit), Auto-expand Comments (discussion collapses
  behind a "Show discussion (N)" button when off; default flipped to TRUE so
  untouched visitors keep today's always-expanded behavior).
- Known no-op left alone: "Load more comments" markup exists but
  hasMoreComments is hard-coded false and all comments load in one fetch —
  nothing user-visible until comment pagination is a real need.
- Intentionally unrouted (not regressions): Notifications/Profile/
  ProfileSetup/NewSubmission/SubmissionDetail pages — per repo CLAUDE.md.
- 219/219 unit tests, lint clean, build clean.

#### Deploy — Phase 5 (PK runs; backend is already live)
```bash
cd .../kbw-blog/kbw-notes
vercel --prod        # ships the new client (likes/report UI + folio fix)
```
Post-deploy check: like a post on kalwaleed.com → count sticks after reload;
Report on a comment flips to "Reported"; comment still moderates in ~5s.

#### Rollback (Phase 5)
`vercel rollback` for the client. Backend: the migration is additive —
old client ignores it entirely; to disable anon engagement hard, delete the
`public-engagement` function (`supabase functions delete public-engagement`).

## Backlog (not started)
> The three active items (pending-submission review, OG unfurl cards, comp-language
> counsel gate) are detailed with options/owners in **`HANDOFF-NEXT.md`**.
- Per-post OG meta tags (X/LinkedIn unfurl cards). Share links WORK but unfurl
  generic — the SPA serves one static `<head>`. Needs prerender/edge middleware.
- Admin surface for `reader_submissions` (32 pending rows sitting unreviewed as
  of 2026-07-05) and for `comment_reports` — service-role/SQL only today.
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
