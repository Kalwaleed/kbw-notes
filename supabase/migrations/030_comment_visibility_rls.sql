-- Tighten the SELECT policy on public.comments so the visibility rule
-- (is_moderated = true) is enforced server-side, not by client query filters.
--
-- Before: "Anyone can view comments" USING (true). The reader app applied
--   .eq('is_moderated', true) on the client to hide pending comments. Any
--   future query that forgot the filter would expose pending content.
-- After: server-enforced. Pending comments (is_moderated = false, queued
--   when AI moderation is unavailable) are visible only to admins.
--
-- Comment lifecycle reference: see CONTEXT.md "Comment lifecycle" — pending,
-- visible, rejected.

drop policy if exists "Anyone can view comments" on public.comments;

create policy "Comments are public when moderated; admins see all"
  on public.comments for select
  using (
    is_moderated = true
    or coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
  );
