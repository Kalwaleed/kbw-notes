-- ============================================================================
-- CRITICAL: Harden the submissions INSERT policy.
-- ============================================================================
--
-- The original policy (migration 006) allowed INSERT with only
--   WITH CHECK (auth.uid() = author_id)
-- and was never restricted to a role or a status. Migrations 019/021 rewrote
-- the UPDATE/DELETE/SELECT policies but left INSERT untouched.
--
-- Combined with anonymous sign-in (migration 029) and the auto-created profile
-- row (handle_new_user, migration 001), this let ANY visitor:
--   1. supabase.auth.signInAnonymously()
--   2. supabase.from('submissions').insert({ author_id, status: 'published', ... })
-- and have arbitrary content go live on the public home feed instantly
-- (the "Published submissions are public" SELECT policy exposes any
-- status = 'published' row).
--
-- Fix: INSERT is authenticated-only, non-anonymous, and drafts-only. Publishing
-- stays on the separate UPDATE path (publishSubmission), which is already gated
-- by the edit-cap policy/trigger from migrations 019/021. This does not break
-- the author flow: createSubmission() already inserts status = 'draft'.
-- ============================================================================

drop policy if exists "Users can insert own submissions" on public.submissions;

create policy "Authenticated authors insert own drafts only"
  on public.submissions
  for insert
  to authenticated
  with check (
    auth.uid() = author_id
    and status = 'draft'
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) is not true
  );
