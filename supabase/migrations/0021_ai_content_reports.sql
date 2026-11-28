-- =============================================================================
-- User reports about AI-generated content (Google Play "AI-Generated Content"
-- policy: users must be able to report offensive AI output from inside the app).
-- Users can only insert their own reports; only admins can read / triage them.
-- =============================================================================

create table if not exists ai_content_reports (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  source      text not null check (source in ('tutor', 'writing', 'speaking', 'dna')),
  reason      text not null check (reason in ('offensive', 'wrong', 'inappropriate', 'other')),
  comment     text check (char_length(comment) <= 1000),
  -- the AI output being reported (and, for the tutor, the question that led to it)
  content     text not null check (char_length(content) <= 8000),
  status      text not null default 'new' check (status in ('new', 'reviewed', 'resolved')),
  created_at  timestamptz not null default now()
);

create index if not exists ai_content_reports_status_idx on ai_content_reports (status, created_at desc);

alter table ai_content_reports enable row level security;

create policy "users insert own ai reports" on ai_content_reports
  for insert to authenticated
  with check (user_id = auth.uid() and status = 'new');

create policy "admins read ai reports" on ai_content_reports
  for select to authenticated
  using (is_dev_admin());

create policy "admins update ai reports" on ai_content_reports
  for update to authenticated
  using (is_dev_admin())
  with check (is_dev_admin());
