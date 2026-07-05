# KBW Notes — Remaining Items (post Phase 5)

State as of 2026-07-05: full QA sweep done, site live-verified functional end to
end (see `HANDOFF.md` Phase 5). Item 1 resolved; item 2 built and awaiting PK's
`vercel --prod`; item 3 sits with PK + counsel. Nothing blocks the site.

---

## 1. ~~32 pending reader submissions~~ — RESOLVED 2026-07-05

**Outcome:** Triage showed all 32 rows were QA/test residue from the June
26–27 intake build-out (every email @example.com or absent; all bodies
self-describing test copy). No genuine reader submission has ever arrived.
PK approved deletion; all 32 rows deleted (storage untouched — test rows
referenced external URLs or real post covers; `reader-submissions/` prefix
was already empty). Queue is now 0.

**Follow-on decision, deferred:** build the admin review surface only when a
first real submission arrives. Intake works and is verified; the digest
process below can serve as the interim triage playbook.

<details><summary>Original item (for context)</summary>

**What:** `reader_submissions` held 32 rows, all `status='pending'`. There is
no UI to read, approve, or reject them — reachable only via service-role SQL.

**Why it matters:** Readers who submitted got "The draft is in review" and
nothing has ever been reviewed. Reputation cost compounds the longer the queue
sits.

**Options (ranked):**
1. **Digest first (zero build):** agent dumps title/name/excerpt of all 32 to a
   private file; PK triages keep/kill in one pass; agent deletes rejects via
   SQL. Decides whether a UI is even warranted. ~15 min.
2. **Minimal admin surface:** `/kbw-notes/review-submissions` behind the
   existing admin role (`k@kbw.vc`), mirroring the Phase 4 reviewer-page
   pattern (RoleGuard + RLS). List → read → approve (promote to `submissions`
   draft) / reject. ~0.5–1 day agent work + `vercel --prod`.
3. Do nothing (queue keeps growing silently).

**Hard rule if a UI is built:** `reader_submissions.*` must still pass through
`contentRenderer.ts` sanitization before any `dangerouslySetInnerHTML`
(HANDOFF.md Phase 3 note). Intake-side stripping is defense-in-depth only.

</details>

**Owner:** closed for now; reopens on first genuine submission.

---

## 2. ~~Share links unfurl without preview cards (OG tags)~~ — BUILT 2026-07-05, awaiting deploy

**Outcome:** Vercel routing middleware built, tested (267/267 incl. 48 new),
and verified against `vercel dev` with spoofed crawler UAs — crawlers get
per-post `og:title`/`og:description`/`og:image` from the `submissions` table,
humans get the SPA untouched. Full detail, deploy checks, accepted-risk note,
and rollback: `HANDOFF.md` Phase 6.

**PK action:** run `vercel --prod` from the repo, then the three post-deploy
checks in HANDOFF.md Phase 6 (curl header check, LinkedIn Post Inspector, X
compose preview).

<details><summary>Original item (for context)</summary>

**What:** X/LinkedIn share URLs work (verified live), but the SPA serves one
static `<head>` for every route — no per-post `og:title` / `og:description` /
`og:image`. Shared links render as bare URLs, not cards.

**Why it matters:** Distribution. A card with the post title + cover image
materially outperforms a naked link on both platforms.

**Approach:** Vercel edge middleware (or a rewrite to an edge function) on
`/kbw-notes/post/:id` that, for crawler user-agents (Twitterbot, LinkedInBot,
facebookexternalhit, WhatsApp), fetches title/excerpt/cover from Supabase and
returns HTML with populated meta tags; humans keep getting the SPA. No SSR
migration needed.

**Scope:** one middleware file + tests + deploy. ~0.5 day agent work +
`vercel --prod`. Note: middleware deploy is `vercel --prod` — PK runs it.

</details>

**Owner:** PK (deploy + post-deploy checks). **Deadline:** none set.

---

## 3. Equity/comp language in `Handoff_from_design_agent/` drafts — counsel gate

**What:** CodeRabbit review flagged, and agent confirmed:
- `KBW-AI-Adoption-Staff-Email.md` — reads as a binding equity grant tied to
  AI adoption ("Every staff member…", "Ownership means…").
- `KBW-AI-Adoption-Mandate.md` (lines ~44–45) — ties Day-30 review compliance
  to bonus/equity enforcement.

**Why it matters:** This is compensation language, not an announcement. Repo
policy already states comp decisions go through counsel, not this system
(HANDOFF.md Phase 4: "NO equity/comp fields — comp decisions go through
counsel"). Distributing as-is creates enforceable-promise risk.

**Action:** PK routes both drafts through counsel/HR before any distribution.
Agent does not edit these — they sit in the design-handoff drop zone under the
cleanup gate (repo CLAUDE.md: no deletions without PK sign-off).

**Owner:** PK + counsel. **Deadline:** before any staff distribution.

---

*File created 2026-07-05 during the Phase 5 QA session. Named `HANDOFF-NEXT.md`
(not `handoff.md`) because macOS's case-insensitive filesystem would collide
with `HANDOFF.md`.*
