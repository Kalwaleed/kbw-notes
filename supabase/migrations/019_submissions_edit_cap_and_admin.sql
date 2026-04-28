-- ============================================================================
-- Submissions: 3-edit cap on published posts, admin-only delete/unpublish
-- Addresses adversarial review finding #5
--
-- Rules (non-admin authors):
--   * Drafts: unlimited UPDATE, can DELETE.
--   * Published: each UPDATE counts as one edit; cap = 3. Cannot unpublish (status -> draft).
--     Cannot DELETE.
--   * Cannot tamper with edit_count column directly (trigger guards it).
-- Admin (raw_app_meta_data.role = 'admin'): bypasses all caps. Can update,
-- unpublish, and delete any submission. Admin updates do NOT increment edit_count.
-- ============================================================================

alter table public.submissions
  add column if not exists edit_count integer not null default 0;

-- public.is_admin() is defined in migration 018.

-- Replace UPDATE policy
drop policy if exists "Users can update own submissions" on public.submissions;
create policy "Users update own submissions within cap; admin always"
  on public.submissions for update
  to authenticated
  using (
    public.is_admin()
    or (
      auth.uid() = author_id
      and (status = 'draft' or edit_count < 3)
    )
  )
  with check (
    public.is_admin()
    or (
      auth.uid() = author_id
      and (status = 'draft' or edit_count < 3)
    )
  );

-- Replace DELETE policy: drafts deletable by author; published only by admin.
drop policy if exists "Users can delete own submissions" on public.submissions;
create policy "Users delete own drafts; admin deletes any"
  on public.submissions for delete
  to authenticated
  using (
    public.is_admin()
    or (auth.uid() = author_id and status = 'draft')
  );

-- Trigger: business rules on UPDATE.
-- Runs BEFORE UPDATE so we can mutate NEW.edit_count or raise.
create or replace function public.enforce_submission_edit_rules()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.is_admin() then
    -- Admin bypass: still pin edit_count if a non-admin field tries to bump it.
    -- Admin may explicitly reset via direct SQL; through the API edit_count stays
    -- unchanged unless explicitly part of NEW.
    return new;
  end if;

  -- Block unpublish (published -> draft) for non-admin.
  if old.status = 'published' and new.status is distinct from old.status then
    raise exception 'Only an admin can change a published submission''s status';
  end if;

  -- Authors cannot reassign authorship.
  if new.author_id is distinct from old.author_id then
    raise exception 'Cannot change author_id';
  end if;

  -- Authors cannot directly tamper with edit_count; force it back to OLD.
  if new.edit_count is distinct from old.edit_count then
    new.edit_count := old.edit_count;
  end if;

  -- If the row is published, this UPDATE is one of the 3 allowed edits.
  if old.status = 'published' then
    if old.edit_count >= 3 then
      raise exception 'Edit cap reached: published submissions allow up to 3 author edits';
    end if;
    new.edit_count := old.edit_count + 1;
  end if;

  return new;
end;
$$;

drop trigger if exists submissions_enforce_edit_rules on public.submissions;
create trigger submissions_enforce_edit_rules
  before update on public.submissions
  for each row execute function public.enforce_submission_edit_rules();
