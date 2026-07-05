-- Anonymous engagement: device-scoped likes for posts and comments, plus
-- comment reports.
--
-- The browser still has NO write access to these tables (RLS write policies
-- require auth.uid() = user_id, which is never true for anon). Anonymous
-- likes/reports flow through the `public-engagement` Edge Function (service
-- role), which calls the *_anon RPCs below. The RPCs are EXECUTE-revoked from
-- client roles so they are not reachable via PostgREST.
--
-- Identity model: an anonymous visitor is a device — `anon_id` is a UUID the
-- client generates once and keeps in localStorage ('kbw-anon-id'). This is
-- best-effort dedupe (clearing storage mints a new identity); the per-IP rate
-- limit in the Edge Function bounds abuse. Same accepted risk envelope as
-- anonymous comments.

-- 1) post_likes: allow anonymous likers (exactly one identity per row)
alter table public.post_likes alter column user_id drop not null;
alter table public.post_likes add column anon_id uuid;
alter table public.post_likes add constraint post_likes_one_identity
  check (num_nonnulls(user_id, anon_id) = 1);
create unique index post_likes_post_id_anon_id_key
  on public.post_likes (post_id, anon_id) where anon_id is not null;

-- 2) comment_likes: same shape
alter table public.comment_likes alter column user_id drop not null;
alter table public.comment_likes add column anon_id uuid;
alter table public.comment_likes add constraint comment_likes_one_identity
  check (num_nonnulls(user_id, anon_id) = 1);
create unique index comment_likes_comment_id_anon_id_key
  on public.comment_likes (comment_id, anon_id) where anon_id is not null;

-- 3) Anonymous likes carry no actor: skip the notification insert entirely
--    (notifications assume a real liker for actor_id/display name).
create or replace function public.notify_on_post_like()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  post_author_id uuid;
  post_title text;
  liker_name text;
begin
  -- Anonymous like: no actor to attribute, no notification.
  if new.user_id is null then
    return new;
  end if;

  select s.author_id, s.title into post_author_id, post_title
  from public.submissions s
  where s.id = new.post_id;

  if post_author_id is null then
    return new;
  end if;

  -- Skip self-likes
  if post_author_id = new.user_id then
    return new;
  end if;

  select display_name into liker_name
  from public.profiles
  where id = new.user_id;

  insert into public.notifications (
    user_id, type, title, message,
    related_entity_type, related_entity_id, action_url, actor_id
  ) values (
    post_author_id,
    'submission_like',
    'Your post was liked',
    coalesce(liker_name, 'Someone') || ' liked "' || coalesce(post_title, 'your post') || '"',
    'submission',
    new.post_id,
    '/kbw-notes/post/' || new.post_id,
    new.user_id
  );

  return new;
end;
$function$;

-- 4) comment_reports: makes the reader-facing "Report" action real.
--    Service-role only; no client policies on purpose.
create table public.comment_reports (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.comments(id) on delete cascade,
  reporter_user_id uuid references public.profiles(id) on delete set null,
  anon_id uuid,
  reason text check (reason is null or length(reason) <= 500),
  created_at timestamptz not null default now(),
  constraint comment_reports_one_identity
    check (num_nonnulls(reporter_user_id, anon_id) = 1)
);
create unique index comment_reports_comment_id_anon_id_key
  on public.comment_reports (comment_id, anon_id) where anon_id is not null;
create unique index comment_reports_comment_id_user_id_key
  on public.comment_reports (comment_id, reporter_user_id) where reporter_user_id is not null;
alter table public.comment_reports enable row level security;

-- 5) Service-role-only RPCs for the Edge Function. Atomic toggle via
--    insert-on-conflict + delete, mirroring public.toggle_comment_like.

create or replace function public.toggle_post_like_anon(p_post_id uuid, p_anon_id uuid)
returns table (liked boolean, like_count bigint)
language plpgsql
set search_path to 'public'
as $function$
begin
  if not exists (
    select 1 from public.submissions s
    where s.id = p_post_id and s.status = 'published'
  ) then
    raise exception 'post not found' using errcode = 'P0002';
  end if;

  insert into public.post_likes (post_id, anon_id)
  values (p_post_id, p_anon_id)
  on conflict (post_id, anon_id) where anon_id is not null do nothing;

  if found then
    liked := true;
  else
    delete from public.post_likes
      where post_id = p_post_id and anon_id = p_anon_id;
    liked := false;
  end if;

  select count(*) into like_count from public.post_likes where post_id = p_post_id;
  return next;
end;
$function$;

create or replace function public.toggle_comment_like_anon(p_comment_id uuid, p_anon_id uuid)
returns table (liked boolean, like_count bigint)
language plpgsql
set search_path to 'public'
as $function$
begin
  if not exists (
    select 1 from public.comments c
    where c.id = p_comment_id and c.is_moderated = true
  ) then
    raise exception 'comment not found' using errcode = 'P0002';
  end if;

  insert into public.comment_likes (comment_id, anon_id)
  values (p_comment_id, p_anon_id)
  on conflict (comment_id, anon_id) where anon_id is not null do nothing;

  if found then
    liked := true;
  else
    delete from public.comment_likes
      where comment_id = p_comment_id and anon_id = p_anon_id;
    liked := false;
  end if;

  select count(*) into like_count from public.comment_likes where comment_id = p_comment_id;
  return next;
end;
$function$;

create or replace function public.report_comment_anon(p_comment_id uuid, p_anon_id uuid)
returns boolean
language plpgsql
set search_path to 'public'
as $function$
begin
  if not exists (
    select 1 from public.comments c
    where c.id = p_comment_id and c.is_moderated = true
  ) then
    raise exception 'comment not found' using errcode = 'P0002';
  end if;

  insert into public.comment_reports (comment_id, anon_id)
  values (p_comment_id, p_anon_id)
  on conflict (comment_id, anon_id) where anon_id is not null do nothing;

  -- true = newly reported, false = this device already reported it
  return found;
end;
$function$;

-- Client roles must not reach these directly; only the Edge Function
-- (service role) calls them.
revoke all on function public.toggle_post_like_anon(uuid, uuid) from public, anon, authenticated;
revoke all on function public.toggle_comment_like_anon(uuid, uuid) from public, anon, authenticated;
revoke all on function public.report_comment_anon(uuid, uuid) from public, anon, authenticated;
grant execute on function public.toggle_post_like_anon(uuid, uuid) to service_role;
grant execute on function public.toggle_comment_like_anon(uuid, uuid) to service_role;
grant execute on function public.report_comment_anon(uuid, uuid) to service_role;
