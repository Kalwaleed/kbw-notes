# ADR 0003 — Server-backed user preferences (cross-device sync) deferred

**Status:** Accepted (2026-05-07)
**Scope:** `src/hooks/useSettings.ts`, `public.profiles`

## Context

Reading preferences (sort order, posts-per-page, auto-expand comments) and appearance preferences (theme) currently persist to localStorage only. The `profiles` table exists; an architectural pass surfaced "build a `UserPreferences` module that syncs preferences to `profiles`, reconciling localStorage and server state."

The app is currently **reader-public** — there is no authenticated UI, no logged-in reader sessions, and no second device to sync to. Authenticated contribution UI is on the roadmap (see `phase-2-real-gate-plan.md`), but authentication is necessary, not sufficient, for pref-sync to earn its keep — users must actually want their reading prefs to follow them across devices.

## Decision

Defer building `UserPreferences`. `useSettings` remains the local-only single source of truth.

Do not pre-build a "seam" or "stub" for future server sync. When authenticated UI returns, `useSettings` will be touched anyway, and pref-sync (if warranted) is the same effort then as now — but designed against real prefs and real conflicts rather than speculation.

## Trigger to revisit

Both gates must pass:

1. Authenticated contribution UI ships (per `phase-2-real-gate-plan.md`) **AND** introduces user-specific preferences beyond reading (editor prefs, notification settings, etc.).
2. At least one user reports preferences not following them across devices.

The trigger is real demand, not the existence of auth.

## Consequences

- Future architecture passes should not re-suggest a `UserPreferences` module until both gates pass.
- The `profiles` table will continue to exist without client-side preference reads/writes.
- Reconciliation logic (server-vs-localStorage conflict resolution) is intentionally not designed in advance.
