# ADR 0002 — Submission edit cap is mirrored in TypeScript with a tagged comment

**Status:** Accepted (2026-05-07)
**Scope:** `src/lib/submissions/rules.ts`, `supabase/migrations/021_fix_submissions_edit_cap_with_check.sql`

## Context

The published-post edit cap (3) is enforced authoritatively by a BEFORE UPDATE trigger (`enforce_submission_edit_rules`) introduced in migration 021. The client renders an `editsRemaining` counter, which requires knowing the cap.

Two ways to keep client and DB aligned:

1. **Mirror the constant in TS, tagged with a comment pointing at the migration.** Cheap, but the constants can drift if SQL changes without updating TS.
2. **Expose a `get_submission_constants()` RPC, cache the result on app load.** Closes drift but adds a network round-trip and a caching layer for one constant that has not changed in production.

## Decision

Mirror the constant in TS:

```ts
// MUST mirror migration 021 trigger enforce_submission_edit_rules: edit_count <= 3
export const PUBLISHED_EDIT_CAP = 3
```

Live in `src/lib/submissions/rules.ts` next to `getSubmissionRules`, not in `src/types/submission.ts`.

## Consequences

- The constant must be updated alongside any SQL change to the trigger. Code review on cap changes must touch both files.
- If a future change introduces multiple capped values (e.g., per-tier caps), revisit and consider the RPC route.
- The DB remains authoritative. A TS-side drift produces wrong UI hints but does not change enforcement — the worst case is "UI says 2 edits remaining, DB rejects on edit 3" which is recoverable.
