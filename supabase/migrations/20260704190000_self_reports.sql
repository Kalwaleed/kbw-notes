-- ============================================================================
-- Weekly AI Adoption Self-Reports (staff) + reviewer assessments.
--
-- Additive-only: two new tables + is_reviewer(). Nothing existing is touched
-- (profiles policy deliberately left alone; staff invites must NOT set name
-- metadata so handle_new_user stores 'Anonymous' on the public profiles row).
--
-- Model:
--   * One row per staff per reporting week (Friday-anchored, Asia/Riyadh).
--     Drafts live in localStorage client-side; only submitted reports hit the
--     DB. Re-submitting before the deadline upserts the same row.
--   * Repeatable form sections are JSONB arrays (shape-checked at the top
--     level here; element shape is validated client-side and rendered
--     defensively). Deadline lateness is computed on read from submitted_at —
--     no clock enforcement in RLS by design.
--   * Reviewer assessments are a SEPARATE table so row-level security can
--     fully hide them from staff (Postgres RLS is row-level, not column-level).
--   * No equity/comp fields anywhere, by explicit decision.
-- ============================================================================

-- Reviewer role helper, mirroring is_admin() (migration 018).
create or replace function public.is_reviewer()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select coalesce(
    (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role') = 'reviewer',
    false
  );
$$;

revoke execute on function public.is_reviewer() from public;
grant execute on function public.is_reviewer() to anon, authenticated, service_role;

-- ----------------------------------------------------------------------------
-- self_reports
-- ----------------------------------------------------------------------------
create table public.self_reports (
  id uuid primary key default gen_random_uuid(),
  -- restrict: deleting an auth user must never silently destroy comp evidence
  staff_id uuid not null references auth.users(id) on delete restrict,
  week_start_date date not null,

  -- Staff details (names come from the form, not profiles — staff profiles
  -- stay 'Anonymous' on the public site)
  staff_name text not null check (char_length(staff_name) between 2 and 120),
  role_function text not null default '' check (char_length(role_function) <= 200),
  main_workstream text not null default '' check (char_length(main_workstream) <= 500),

  -- Repeatable sections: JSONB arrays, top-level shape enforced here so a raw
  -- PostgREST write with a staff JWT cannot corrupt what the reviewer reads.
  tools      jsonb not null default '[]' check (jsonb_typeof(tools)      = 'array' and pg_column_size(tools)      <= 50000),
  coverage   jsonb not null default '[]' check (jsonb_typeof(coverage)   = 'array' and pg_column_size(coverage)   <= 50000),
  hours      jsonb not null default '[]' check (jsonb_typeof(hours)      = 'array' and pg_column_size(hours)      <= 50000),
  quality    jsonb not null default '[]' check (jsonb_typeof(quality)    = 'array' and pg_column_size(quality)    <= 50000),
  workflows  jsonb not null default '[]' check (jsonb_typeof(workflows)  = 'array' and pg_column_size(workflows)  <= 50000),
  disclosure jsonb not null default '[]' check (jsonb_typeof(disclosure) = 'array' and pg_column_size(disclosure) <= 50000),
  blockers   jsonb not null default '[]' check (jsonb_typeof(blockers)   = 'array' and pg_column_size(blockers)   <= 50000),

  -- Section totals / scalar answers
  tools_total_active int not null default 0 check (tools_total_active between 0 and 1000),
  tools_total_daily  int not null default 0 check (tools_total_daily  between 0 and 1000),
  overall_ai_pct     int not null default 0 check (overall_ai_pct between 0 and 100),
  total_hours_saved  numeric(6,2) not null default 0 check (total_hours_saved >= 0),
  net_quality        text not null check (net_quality in ('better', 'same', 'worse')),
  errors_found       boolean not null default false,
  errors_corrected   text not null default '' check (char_length(errors_corrected) <= 2000),
  workflow_doc_submitted boolean not null default false,
  cumulative_workflows   int not null default 0 check (cumulative_workflows between 0 and 1000),
  submitted_without_review boolean not null default false,
  without_review_explain   text not null default '' check (char_length(without_review_explain) <= 2000),

  -- Certification (section 8)
  cert_name      text not null check (char_length(cert_name) between 2 and 120),
  cert_signature text not null check (char_length(cert_signature) between 2 and 200),
  cert_date      date not null,

  submitted_at timestamptz not null default now(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  unique (staff_id, week_start_date)
);

create index idx_self_reports_week on public.self_reports (week_start_date desc);
create index idx_self_reports_staff on public.self_reports (staff_id, week_start_date desc);

create trigger update_self_reports_updated_at
  before update on public.self_reports
  for each row execute function public.update_updated_at_column();

-- Re-submission (upsert) refreshes submitted_at so lateness reflects the
-- LAST submission, not the first.
create or replace function public.touch_self_report_submitted_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.submitted_at = now();
  return new;
end;
$$;

create trigger touch_self_reports_submitted_at
  before update on public.self_reports
  for each row execute function public.touch_self_report_submitted_at();

alter table public.self_reports enable row level security;
alter table public.self_reports force row level security;

-- Staff: read and write their own reports only. No DELETE policy for anyone —
-- comp evidence is never deleted through the API.
create policy "Staff read own self reports"
  on public.self_reports for select
  to authenticated
  using (auth.uid() = staff_id or public.is_reviewer() or public.is_admin());

create policy "Staff insert own self reports"
  on public.self_reports for insert
  to authenticated
  with check (auth.uid() = staff_id);

create policy "Staff update own self reports"
  on public.self_reports for update
  to authenticated
  using (auth.uid() = staff_id)
  with check (auth.uid() = staff_id);

-- ----------------------------------------------------------------------------
-- self_report_reviews — reviewer-only surface, invisible to staff
-- ----------------------------------------------------------------------------
create table public.self_report_reviews (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null unique references public.self_reports(id) on delete restrict,
  reviewer_id uuid not null references auth.users(id) on delete restrict,

  submitted_on_time       text not null check (submitted_on_time in ('pass', 'miss')),
  tool_usage_credible     text not null check (tool_usage_credible in ('pass', 'question')),
  evidence_provided       text not null check (evidence_provided in ('pass', 'partial', 'miss')),
  hours_saved_reasonable  text not null check (hours_saved_reasonable in ('pass', 'question')),
  disclosure_compliance   text not null check (disclosure_compliance in ('pass', 'miss', 'na')),
  workflow_doc_progress   text not null check (workflow_doc_progress in ('on_track', 'at_risk', 'behind')),
  escalation_needed       boolean not null default false,
  comments                text not null default '' check (char_length(comments) <= 5000),
  weekly_status           text not null check (weekly_status in ('on_track', 'at_risk', 'not_started')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger update_self_report_reviews_updated_at
  before update on public.self_report_reviews
  for each row execute function public.update_updated_at_column();

alter table public.self_report_reviews enable row level security;
alter table public.self_report_reviews force row level security;

-- Reviewer + admin only. Staff have NO policies on this table: with RLS
-- forced and no matching policy, every staff request returns zero rows.
create policy "Reviewers read reviews"
  on public.self_report_reviews for select
  to authenticated
  using (public.is_reviewer() or public.is_admin());

create policy "Reviewers insert reviews"
  on public.self_report_reviews for insert
  to authenticated
  with check ((public.is_reviewer() or public.is_admin()) and reviewer_id = auth.uid());

create policy "Reviewers update reviews"
  on public.self_report_reviews for update
  to authenticated
  using (public.is_reviewer() or public.is_admin())
  with check ((public.is_reviewer() or public.is_admin()) and reviewer_id = auth.uid());
