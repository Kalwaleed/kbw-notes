# ADR 0004 — Authentication and authorization are intentionally layered, not unified

**Status:** Accepted (2026-05-07)
**Scope:** `src/contexts/AuthContext.tsx`, `supabase/functions/request-magic-link/`, `supabase/migrations/015-018`

## Context

Invite-only magic-link sign-in is enforced across four runtimes:

| Layer | Where | Job |
|---|---|---|
| Client | `AuthContext.isEmailAllowed` | NFKC + invisible-char strip + `@kbw.vc` regex. UX fast-fail only. |
| Edge Function | `request-magic-link/index.ts` | Per-IP and per-email rate limiting via `rate_limit_increment`, `invited_emails` table check, magic-link dispatch. Logs every attempt to `auth_audit`. Always returns 200 to prevent invite-list enumeration. |
| DB Auth Hook | migration 015 | Rejects non-`@kbw.vc` signups at the auth layer. Authoritative domain gate. |
| RLS | migrations 016–018 | Admin role gates `invited_emails` access; per-table RLS gates row-level access elsewhere. Admin role lives in `auth.users.raw_app_meta_data.role`. |

An architectural pass surfaced this as "scattered" and proposed a unified `AuthorizationPolicy` module spanning all four layers.

Layer-by-layer deletion test:

- Drop client `isEmailAllowed` → server still rejects non-`@kbw.vc`. UX worse, security unchanged.
- Drop Edge Function rate-limit + invite-check → unlimited magic-link spam, invite list bypassable.
- Drop auth hook → anyone signs up.
- Drop admin RLS → any authenticated user reads/edits `invited_emails`.

Each layer fails differently, runs in a different runtime (browser, Deno, plpgsql), and owns a distinct concern.

## Decision

Do not unify authorization rules into a single client-side `AuthorizationPolicy` module. The layered design is intentional defense-in-depth.

New rules are added at the layer that owns the concern:

- UX-level fast-fail → client
- Rate limiting and audit logging → Edge Function
- Account creation → DB auth hook
- Row-level read/write authorization → RLS

## Consequences

- Future architecture passes should not re-suggest unification.
- When authenticated contribution UI returns (per ADR 0003 / `phase-2-real-gate-plan.md`), role-based authorization (reader/author/admin) is expected to expand at the RLS layer plus a contribution-write Edge Function — not via a unified client-side policy module.
- Re-evaluate this ADR only if a single rule starts genuinely needing to cross all four layers in lockstep, which has not happened in 6+ migrations of auth evolution.
