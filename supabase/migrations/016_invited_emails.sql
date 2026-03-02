-- Invite-only access: only emails in this table can receive magic links
create table if not exists public.invited_emails (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Enforce lowercase emails via constraint
alter table public.invited_emails
  add constraint invited_emails_email_lowercase check (email = lower(email));

-- Index for fast lookup
create index if not exists idx_invited_emails_email on public.invited_emails(email);

-- RLS
alter table public.invited_emails enable row level security;

-- Anyone can check if an email is invited (needed pre-auth)
create policy "Anyone can check invited emails"
  on public.invited_emails for select
  using (true);

-- Only authenticated users can manage invites
create policy "Authenticated users can insert invites"
  on public.invited_emails for insert
  to authenticated
  with check (true);

create policy "Authenticated users can delete invites"
  on public.invited_emails for delete
  to authenticated
  using (true);

-- Seed initial invited emails
insert into public.invited_emails (email) values
  ('f.chaaban@kbw.vc'),
  ('turki@kbw.vc'),
  ('abdoon@kbw.vc'),
  ('steve@kbw.vc'),
  ('ekta@kbw.vc'),
  ('m.suiche@kbw.vc'),
  ('matt@kbw.vc'),
  ('roy@kbw.vc')
on conflict (email) do nothing;
