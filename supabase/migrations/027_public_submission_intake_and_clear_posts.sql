-- Public reader submission intake.
-- Anonymous users may submit drafts for review, but cannot read, edit, publish,
-- upload media, or administer submissions.

create table if not exists public.reader_submissions (
  id uuid primary key default gen_random_uuid(),
  submitter_name text not null check (char_length(trim(submitter_name)) between 2 and 120),
  submitter_email text check (
    submitter_email is null
    or submitter_email = ''
    or submitter_email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  ),
  title text not null check (char_length(trim(title)) between 3 and 180),
  excerpt text not null default '' check (char_length(excerpt) <= 500),
  content text not null check (char_length(trim(content)) between 20 and 30000),
  tags text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewer_notes text
);

create index if not exists reader_submissions_created_at_idx
  on public.reader_submissions (created_at desc);

create index if not exists reader_submissions_status_idx
  on public.reader_submissions (status);

alter table public.reader_submissions enable row level security;

drop policy if exists "reader_submissions_admin_read" on public.reader_submissions;
create policy "reader_submissions_admin_read"
  on public.reader_submissions for select
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "reader_submissions_admin_update" on public.reader_submissions;
create policy "reader_submissions_admin_update"
  on public.reader_submissions for update
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "reader_submissions_admin_delete" on public.reader_submissions;
create policy "reader_submissions_admin_delete"
  on public.reader_submissions for delete
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create or replace function public.submit_reader_submission(
  p_submitter_name text,
  p_submitter_email text,
  p_title text,
  p_excerpt text,
  p_content text,
  p_tags text[] default '{}'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  cleaned_tags text[];
  inserted_id uuid;
begin
  p_submitter_name := trim(coalesce(p_submitter_name, ''));
  p_submitter_email := nullif(lower(trim(coalesce(p_submitter_email, ''))), '');
  p_title := trim(coalesce(p_title, ''));
  p_excerpt := trim(coalesce(p_excerpt, ''));
  p_content := trim(coalesce(p_content, ''));

  if char_length(p_submitter_name) < 2 or char_length(p_submitter_name) > 120 then
    raise exception 'Name must be between 2 and 120 characters' using errcode = '22023';
  end if;

  if p_submitter_email is not null and p_submitter_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' then
    raise exception 'Email is invalid' using errcode = '22023';
  end if;

  if char_length(p_title) < 3 or char_length(p_title) > 180 then
    raise exception 'Title must be between 3 and 180 characters' using errcode = '22023';
  end if;

  if char_length(p_excerpt) > 500 then
    raise exception 'Excerpt must be 500 characters or fewer' using errcode = '22023';
  end if;

  if char_length(p_content) < 20 or char_length(p_content) > 30000 then
    raise exception 'Post body must be between 20 and 30000 characters' using errcode = '22023';
  end if;

  select coalesce(array_agg(tag), '{}')
  into cleaned_tags
  from (
    select distinct lower(trim(tag)) as tag
    from unnest(coalesce(p_tags, '{}')) as tag
    where trim(tag) <> ''
    limit 8
  ) t;

  insert into public.reader_submissions (
    submitter_name,
    submitter_email,
    title,
    excerpt,
    content,
    tags
  )
  values (
    p_submitter_name,
    p_submitter_email,
    p_title,
    p_excerpt,
    p_content,
    cleaned_tags
  )
  returning id into inserted_id;

  return inserted_id;
end;
$$;

revoke all on function public.submit_reader_submission(text, text, text, text, text, text[]) from public;
grant execute on function public.submit_reader_submission(text, text, text, text, text[]) to anon, authenticated;

-- One-time reset: remove currently published/public blog content so the reader
-- starts fresh. Drafts and private intake rows are preserved.
delete from public.comments
where post_id in (select id from public.submissions where status = 'published');

delete from public.post_likes
where post_id in (select id from public.submissions where status = 'published');

delete from public.post_bookmarks
where post_id in (select id from public.submissions where status = 'published');

delete from public.submissions
where status = 'published';

delete from public.blog_posts;
