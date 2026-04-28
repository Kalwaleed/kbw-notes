-- ============================================================================
-- Bugfix: edit cap was firing one update too early + silently dropping the
-- 4th attempt instead of returning a useful error.
--
-- Original migration 019 expressed the cap in two places:
--   * RLS USING + WITH CHECK both contained `edit_count < 3`.
--   * Trigger enforce_submission_edit_rules raised on `old.edit_count >= 3`.
--
-- Two problems:
--   1. RLS evaluates USING against OLD and WITH CHECK against NEW. The
--      BEFORE UPDATE trigger increments NEW.edit_count between them, so
--      edit #3 (OLD=2, NEW=3) passed USING but failed WITH CHECK because
--      3 < 3 is false. Authors got 2 edits, not 3.
--   2. On edit #4, RLS USING `edit_count < 3` filtered the row out and
--      PostgREST returned 200 with `[]` (no rows matched). The user got no
--      indication their edit was silently dropped.
--
-- Cleaner factoring: RLS handles WHO, trigger handles HOW MANY. Drop the
-- count check from USING so the trigger's RAISE actually reaches the client
-- as a 400. Keep `edit_count <= 3` in WITH CHECK as a defense-in-depth
-- ceiling in case something ever bypasses the trigger.
-- ============================================================================

drop policy if exists "Users update own submissions within cap; admin always" on public.submissions;
create policy "Users update own submissions; trigger enforces cap"
  on public.submissions for update
  to authenticated
  using (
    public.is_admin()
    or auth.uid() = author_id
  )
  with check (
    public.is_admin()
    or (
      auth.uid() = author_id
      and edit_count <= 3
    )
  );

-- Use auth.jwt() instead of reading the GUC directly. Functionally equivalent
-- for the supported case but cleaner and matches the rest of the codebase.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- Bonus fix: PostgreSQL enforces SELECT-visibility on the post-update row.
-- An admin updating someone else's published submission to status='draft'
-- previously failed because:
--   * "Users can view own submissions" requires auth.uid() = author_id (admin
--     isn't the author)
--   * "Published submissions are public" requires status='published' (the new
--     row is now draft)
-- Neither SELECT policy covers admin's post-update view of the row, so PG
-- rejects the UPDATE with "new row violates row-level security policy".
-- Replacing the author-only SELECT policy with one that also lets admins read
-- everything makes admin-only delete/unpublish actually work.
drop policy if exists "Users can view own submissions" on public.submissions;
create policy "Users can view own submissions; admin can view all"
  on public.submissions for select
  to authenticated
  using (public.is_admin() or auth.uid() = author_id);
