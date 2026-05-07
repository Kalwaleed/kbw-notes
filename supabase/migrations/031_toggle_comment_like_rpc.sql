-- Atomic toggle for comment_likes via unique-constraint conflict.
--
-- Replaces the client-side select-then-insert/delete pattern in
-- src/lib/queries/comments.ts. The unique index (comment_id, user_id)
-- serializes concurrent toggles by the same user; no TOCTOU race, no
-- duplicate-insert errors.
--
-- SECURITY INVOKER so existing RLS on comment_likes still gates writes
-- (INSERT requires auth.uid() = user_id, DELETE requires auth.uid() =
-- user_id). The function reads auth.uid() server-side; clients do not
-- pass user_id.
--
-- See CONTEXT.md "Engagement" for the contract.

create or replace function public.toggle_comment_like(p_comment_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'Authentication required to toggle comment like'
      using errcode = '42501';
  end if;

  insert into public.comment_likes (comment_id, user_id)
  values (p_comment_id, v_user)
  on conflict (comment_id, user_id) do nothing;

  if found then
    return true; -- row inserted; now liked
  end if;

  delete from public.comment_likes
    where comment_id = p_comment_id
      and user_id = v_user;

  return false; -- row removed; now unliked
end;
$$;

revoke all on function public.toggle_comment_like(uuid) from public;
grant execute on function public.toggle_comment_like(uuid) to authenticated;
