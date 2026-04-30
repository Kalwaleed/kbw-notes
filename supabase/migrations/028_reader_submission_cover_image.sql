alter table public.reader_submissions
  add column if not exists cover_image_url text;

alter table public.reader_submissions
  drop constraint if exists reader_submissions_cover_image_url_check;

alter table public.reader_submissions
  add constraint reader_submissions_cover_image_url_check
  check (
    cover_image_url is null
    or cover_image_url = ''
    or cover_image_url ~* '^https?://'
  );

drop function if exists public.submit_reader_submission(text, text, text, text, text, text[]);

create or replace function public.submit_reader_submission(
  p_submitter_name text,
  p_submitter_email text,
  p_title text,
  p_excerpt text,
  p_content text,
  p_tags text[] default '{}',
  p_cover_image_url text default null
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
  p_cover_image_url := nullif(trim(coalesce(p_cover_image_url, '')), '');

  if char_length(p_submitter_name) < 2 or char_length(p_submitter_name) > 120 then
    raise exception 'Name must be between 2 and 120 characters' using errcode = '22023';
  end if;

  if p_submitter_email is not null and p_submitter_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' then
    raise exception 'Email is invalid' using errcode = '22023';
  end if;

  if p_cover_image_url is not null and p_cover_image_url !~* '^https?://' then
    raise exception 'Cover image must be an http or https URL' using errcode = '22023';
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
    tags,
    cover_image_url
  )
  values (
    p_submitter_name,
    p_submitter_email,
    p_title,
    p_excerpt,
    p_content,
    cleaned_tags,
    p_cover_image_url
  )
  returning id into inserted_id;

  return inserted_id;
end;
$$;

revoke all on function public.submit_reader_submission(text, text, text, text, text, text[], text) from public;
grant execute on function public.submit_reader_submission(text, text, text, text, text, text[], text) to anon, authenticated;
