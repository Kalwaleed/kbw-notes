-- ============================================================================
-- Phase 2b: remove the invite/magic-link machinery.
-- ============================================================================
--
-- Entry to KBW Notes is now a single password on the static landing page; there
-- are no user accounts, magic links, or @kbw.vc invite gating. The client-side
-- requestMagicLink/isEmailAllowed code, the request-magic-link and auto-sign-in
-- Edge Functions, and the invites query layer have all been removed.
--
-- This drops the now-unreferenced invited_emails allowlist. CASCADE removes its
-- RLS policies and any dependent invite-management objects.
--
-- NOT dropped here (deliberately) — handle via the manual steps in HANDOFF.md:
--   * public.hook_restrict_email_domain(jsonb) — still wired to the dashboard
--     "Before User Created" auth hook; disable the hook in the dashboard first,
--     then it can be dropped safely.
--   * public.auth_audit — retained as a historical log; harmless if unused.
-- ============================================================================

drop table if exists public.invited_emails cascade;
