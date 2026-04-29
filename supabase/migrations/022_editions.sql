-- 022_editions.sql
-- Adds the `editions` table that powers the folio bar (RUN №NNN · EDITION YYYY.MM.DD).
-- An edition is a publication "issue." Exactly one row is current at a time, enforced
-- by a unique partial index. The current edition is publicly readable to authenticated
-- users; only admins may insert new editions.

create table if not exists public.editions (
  id           uuid primary key default gen_random_uuid(),
  run_number   integer not null check (run_number > 0),
  edition_date date    not null,
  started_at   timestamptz not null default now(),
  is_current   boolean not null default false,
  unique (run_number)
);

-- At most one row may have is_current = true.
create unique index if not exists editions_one_current
  on public.editions (is_current)
  where is_current;

alter table public.editions enable row level security;

-- Authenticated users may read editions (the folio bar needs to render).
drop policy if exists "editions_select_authenticated" on public.editions;
create policy "editions_select_authenticated"
  on public.editions for select
  to authenticated
  using (true);

-- Only admins may insert/update/delete. Admin = JWT claim role = 'admin'.
drop policy if exists "editions_admin_write" on public.editions;
create policy "editions_admin_write"
  on public.editions for all
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Seed Run №001 starting today if no editions exist yet.
insert into public.editions (run_number, edition_date, is_current)
select 1, current_date, true
where not exists (select 1 from public.editions);

-- advance_edition() — admin-only RPC that retires the current edition
-- and creates a new one with run_number = max + 1, edition_date = today.
create or replace function public.advance_edition()
returns public.editions
language plpgsql
security definer
set search_path = public
as $$
declare
  is_admin boolean;
  next_run integer;
  inserted public.editions;
begin
  is_admin := coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
  if not is_admin then
    raise exception 'advance_edition: admin role required'
      using errcode = '42501';
  end if;

  update public.editions set is_current = false where is_current;
  select coalesce(max(run_number), 0) + 1 into next_run from public.editions;

  insert into public.editions (run_number, edition_date, is_current)
  values (next_run, current_date, true)
  returning * into inserted;

  return inserted;
end;
$$;

revoke all on function public.advance_edition() from public;
grant execute on function public.advance_edition() to authenticated;
