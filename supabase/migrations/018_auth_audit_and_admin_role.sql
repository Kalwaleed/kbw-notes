-- ============================================================================
-- Auth audit log + admin-only invite governance + bootstrap admin role
-- Addresses adversarial review findings #1, #2, #4
-- ============================================================================

-- 1. Bootstrap admin role for k@kbw.vc.
-- Stored in raw_app_meta_data so it appears in the JWT (auth.jwt()->'app_metadata'->>'role').
update auth.users
   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
 where email = 'k@kbw.vc';

-- 1a. is_admin() helper used by RLS across the project.
-- Reads the role from the request JWT's app_metadata (server-controlled claim).
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select coalesce(
    (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;

-- 2. auth_audit table — every sign-in attempt, pass or fail
create table if not exists public.auth_audit (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  user_id uuid references auth.users(id) on delete set null,
  event text not null check (event in (
    'link_requested',
    'denied_domain',
    'denied_not_invited',
    'rate_limited',
    'send_failed',
    'signed_in',
    'signed_out',
    'legacy_endpoint'
  )),
  ip text,
  user_agent text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_auth_audit_email_created
  on public.auth_audit (email, created_at desc);
create index if not exists idx_auth_audit_event_created
  on public.auth_audit (event, created_at desc);

alter table public.auth_audit enable row level security;

-- Admin-only read. Service role bypasses RLS for inserts.
create policy "Admin can read auth_audit"
  on public.auth_audit for select
  to authenticated
  using (public.is_admin());

-- No INSERT/UPDATE/DELETE policies — only service role writes (and never updates/deletes).

-- 3. Lock down invited_emails — admin-only for all client access.
-- Edge functions use service role and bypass RLS.
drop policy if exists "Anyone can check invited emails" on public.invited_emails;
drop policy if exists "Authenticated users can insert invites" on public.invited_emails;
drop policy if exists "Authenticated users can delete invites" on public.invited_emails;

create policy "Admin can read invited_emails"
  on public.invited_emails for select
  to authenticated
  using (public.is_admin());

create policy "Admin can insert invited_emails"
  on public.invited_emails for insert
  to authenticated
  with check (public.is_admin());

create policy "Admin can update invited_emails"
  on public.invited_emails for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admin can delete invited_emails"
  on public.invited_emails for delete
  to authenticated
  using (public.is_admin());

-- 4. Atomic rate-limit increment RPC.
-- Replaces the select-then-update pattern in edge functions. Returns the
-- post-increment count so the caller can compare against its limit. Window is
-- rolled forward when the existing record's window has expired.
create or replace function public.rate_limit_increment(
  p_identifier text,
  p_window_ms integer
) returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := now();
  v_window_start timestamptz;
  v_count integer;
begin
  insert into public.rate_limits (identifier, count, window_start)
  values (p_identifier, 1, v_now)
  on conflict (identifier) do update
    set count = case
      when public.rate_limits.window_start < v_now - make_interval(secs => p_window_ms / 1000.0)
        then 1
      else public.rate_limits.count + 1
    end,
    window_start = case
      when public.rate_limits.window_start < v_now - make_interval(secs => p_window_ms / 1000.0)
        then v_now
      else public.rate_limits.window_start
    end
  returning count, window_start into v_count, v_window_start;

  return v_count;
end;
$$;

revoke execute on function public.rate_limit_increment(text, integer) from public, anon, authenticated;
grant execute on function public.rate_limit_increment(text, integer) to service_role;
