-- ============================================================================
-- Comments: revoke the is_moderated=true client-insert bypass and lock down
-- updates so users cannot edit moderated content into something else.
-- Addresses adversarial review findings #3 and #4.
--
-- After this migration:
--   * Clients have NO INSERT policy on comments. Only the moderate-comment
--     edge function (service role) can insert. The migration 002 policy that
--     allowed is_moderated=true inserts is dropped.
--   * Clients can UPDATE only to perform the soft-delete pattern that
--     queries/comments.ts already uses (replace content with the deletion
--     marker). Any other content change is blocked by trigger. Admins bypass.
-- ============================================================================

-- 1. Drop the bypassable INSERT policy from migration 002.
drop policy if exists "Comments must be AI moderated before insertion" on public.comments;

-- 2. Replace UPDATE policy with the same auth.uid()=user_id check (admins also).
drop policy if exists "Users can update their own comments except moderation status" on public.comments;
create policy "Users can update own comments; admin can update any"
  on public.comments for update
  to authenticated
  using (public.is_admin() or auth.uid() = user_id)
  with check (public.is_admin() or auth.uid() = user_id);

-- 3. Trigger: block content edits except the soft-delete marker.
-- Existing prevent_moderation_change trigger from migration 002 still guards
-- is_moderated. We add a second BEFORE UPDATE trigger for content.
create or replace function public.enforce_comment_content_immutable()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.is_admin() then
    return new;
  end if;
  if old.content is distinct from new.content
     and new.content <> '[This comment has been deleted]' then
    raise exception 'Comment content cannot be edited. To remove a comment, delete it.';
  end if;
  return new;
end;
$$;

drop trigger if exists comments_content_immutable on public.comments;
create trigger comments_content_immutable
  before update on public.comments
  for each row execute function public.enforce_comment_content_immutable();
