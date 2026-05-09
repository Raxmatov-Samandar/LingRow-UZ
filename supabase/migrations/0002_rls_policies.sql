-- =============================================================================
-- Row Level Security  (Plan v2 §3 — protect children, parents, payments)
-- =============================================================================

alter table profiles            enable row level security;
alter table progress            enable row level security;
alter table user_lesson_progress enable row level security;
alter table user_vocab          enable row level security;
alter table user_quiz_attempts  enable row level security;
alter table ai_feedback         enable row level security;
alter table parent_profiles     enable row level security;
alter table parent_children     enable row level security;
alter table parental_controls   enable row level security;
alter table daily_reports       enable row level security;
alter table subscriptions       enable row level security;
alter table payments            enable row level security;

alter table lessons             enable row level security;
alter table vocab_words         enable row level security;
alter table quiz_questions      enable row level security;
alter table sms_log             enable row level security;
alter table otp_codes           enable row level security;

-- ---------------------------------------------------------------------------
-- Helper: is the current user the parent linked to a given child?
-- ---------------------------------------------------------------------------
create or replace function is_parent_of(target_child uuid)
returns boolean
language sql security definer
as $$
  select exists (
    select 1
    from parent_children pc
    join parent_profiles pp on pp.id = pc.parent_id
    where pp.user_id = auth.uid()
      and pc.child_id = target_child
      and pc.is_active = true
  );
$$;
grant execute on function is_parent_of(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- profiles — users see/update only their own row; parent can read child's row
-- ---------------------------------------------------------------------------
create policy "profiles self select" on profiles
  for select using (id = auth.uid() or is_parent_of(id));

create policy "profiles self update" on profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

create policy "profiles self insert" on profiles
  for insert with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- progress — same pattern (parent reads only)
-- ---------------------------------------------------------------------------
create policy "progress self read"  on progress for select using (user_id = auth.uid() or is_parent_of(user_id));
create policy "progress self write" on progress for all    using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- lessons / vocab / quiz_questions  → public-read for any authenticated user
-- ---------------------------------------------------------------------------
create policy "lessons readable"      on lessons        for select using (auth.role() = 'authenticated' and is_published);
create policy "vocab readable"        on vocab_words    for select using (auth.role() = 'authenticated');
create policy "quiz readable"         on quiz_questions for select using (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- user_lesson_progress / user_vocab / user_quiz_attempts / ai_feedback
-- ---------------------------------------------------------------------------
create policy "lesson progress self" on user_lesson_progress
  for all using (user_id = auth.uid() or is_parent_of(user_id))
        with check (user_id = auth.uid());

create policy "vocab self"           on user_vocab
  for all using (user_id = auth.uid() or is_parent_of(user_id))
        with check (user_id = auth.uid());

create policy "quiz attempts self"   on user_quiz_attempts
  for all using (user_id = auth.uid() or is_parent_of(user_id))
        with check (user_id = auth.uid());

create policy "ai feedback self"     on ai_feedback
  for all using (user_id = auth.uid() or is_parent_of(user_id))
        with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- parent_profiles
-- ---------------------------------------------------------------------------
create policy "parent profile self"  on parent_profiles
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- parent_children — parent sees own rows; child sees rows pointing to them
-- ---------------------------------------------------------------------------
create policy "parent children select" on parent_children for select using (
  (parent_id in (select id from parent_profiles where user_id = auth.uid()))
  or child_id = auth.uid()
);
create policy "parent children insert" on parent_children for insert with check (
  parent_id in (select id from parent_profiles where user_id = auth.uid())
);
create policy "parent children update" on parent_children for update using (
  parent_id in (select id from parent_profiles where user_id = auth.uid())
  or child_id = auth.uid()
);

-- ---------------------------------------------------------------------------
-- parental_controls — parent can edit; child can read own
-- ---------------------------------------------------------------------------
create policy "parental controls read"  on parental_controls
  for select using (child_id = auth.uid() or is_parent_of(child_id));
create policy "parental controls write" on parental_controls
  for all using (is_parent_of(child_id)) with check (is_parent_of(child_id));

-- ---------------------------------------------------------------------------
-- daily_reports
-- ---------------------------------------------------------------------------
create policy "daily reports select" on daily_reports
  for select using (child_id = auth.uid() or is_parent_of(child_id));
-- Inserts happen via service-role only (cron / edge function), so no insert policy needed for clients.

-- ---------------------------------------------------------------------------
-- subscriptions / payments — user reads own; writes only via service role
-- ---------------------------------------------------------------------------
create policy "subscriptions self"  on subscriptions for select using (user_id = auth.uid());
create policy "payments self"       on payments      for select using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- otp_codes / sms_log — never readable by clients (service role only)
-- ---------------------------------------------------------------------------
-- (no policies => RLS denies all)
