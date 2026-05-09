-- =============================================================================
-- Postgres functions: profile bootstrap, SM-2 spaced repetition, streak,
-- daily-report aggregation.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Auto-create a profiles + progress row whenever a new auth.users row appears.
-- Set role/age/name from the user_metadata supplied at sign-up.
-- ---------------------------------------------------------------------------
create or replace function handle_new_user()
returns trigger
language plpgsql security definer
as $$
declare meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into profiles (id, name, email, phone, role, age)
  values (
    new.id,
    coalesce(meta->>'name', split_part(new.email, '@', 1), 'New user'),
    new.email,
    new.phone,
    coalesce((meta->>'role')::user_role, 'student'),
    nullif(meta->>'age','')::integer
  )
  on conflict (id) do nothing;

  insert into progress (user_id) values (new.id) on conflict do nothing;

  -- if registering as parent, create parent_profiles row too
  if (meta->>'role') = 'parent' then
    insert into parent_profiles (user_id, phone) values (new.id, new.phone)
    on conflict do nothing;
  end if;

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------------
-- SM-2 spaced repetition update.
--   quality 0–5 → returns updated row.
--   Reference: https://en.wikipedia.org/wiki/SuperMemo#SM-2
-- ---------------------------------------------------------------------------
create or replace function sm2_review(p_user uuid, p_word uuid, p_quality int)
returns user_vocab
language plpgsql security definer as $$
declare
  v user_vocab;
  ef numeric(4,2);
  reps integer;
  interv integer;
begin
  if p_quality < 0 or p_quality > 5 then
    raise exception 'quality must be 0..5';
  end if;

  select * into v from user_vocab where user_id = p_user and word_id = p_word;

  if not found then
    insert into user_vocab(user_id, word_id) values (p_user, p_word) returning * into v;
  end if;

  -- failed → reset
  if p_quality < 3 then
    reps   := 0;
    interv := 1;
    ef     := greatest(1.3, v.ease_factor - 0.20);
  else
    reps := v.repetitions + 1;
    if    reps = 1 then interv := 1;
    elsif reps = 2 then interv := 6;
    else  interv := round(v.interval_days * v.ease_factor);
    end if;
    ef := greatest(1.3, v.ease_factor + (0.1 - (5 - p_quality)*(0.08 + (5 - p_quality)*0.02)));
  end if;

  update user_vocab
     set repetitions   = reps,
         interval_days = interv,
         ease_factor   = ef,
         next_review   = now() + (interv || ' days')::interval,
         last_quality  = p_quality
   where user_id = p_user and word_id = p_word
   returning * into v;

  return v;
end $$;
grant execute on function sm2_review(uuid, uuid, int) to authenticated;

-- ---------------------------------------------------------------------------
-- Award XP & update streak. Called from edge functions / triggers.
-- ---------------------------------------------------------------------------
create or replace function award_xp(p_user uuid, p_xp int)
returns progress
language plpgsql security definer as $$
declare
  p progress;
begin
  insert into progress (user_id, xp, streak, level, last_active_date)
  values (p_user, p_xp, 1, 1, current_date)
  on conflict (user_id) do update
    set xp     = progress.xp + p_xp,
        level  = greatest(1, ((progress.xp + p_xp) / 1000)::int),
        streak = case
                   when progress.last_active_date = current_date          then progress.streak
                   when progress.last_active_date = current_date - 1      then progress.streak + 1
                   else 1
                 end,
        last_active_date = current_date
  returning * into p;
  return p;
end $$;
grant execute on function award_xp(uuid, int) to authenticated;

-- ---------------------------------------------------------------------------
-- Daily report aggregator. Used by daily-report edge function (cron 20:00).
-- Builds (or upserts) a row in daily_reports for every active child.
-- ---------------------------------------------------------------------------
create or replace function build_daily_reports(p_date date default current_date)
returns integer
language plpgsql security definer as $$
declare
  inserted integer := 0;
begin
  insert into daily_reports
    (child_id, date, minutes_spent, lessons_done, quiz_correct, xp_earned, streak_maintained)
  select
    pc.child_id,
    p_date,
    coalesce(sum(case when ulp.completed_at::date = p_date then l.duration_min end), 0),
    count(*) filter (where ulp.completed_at::date = p_date),
    coalesce(sum(case when uqa.taken_at::date = p_date then uqa.correct end), 0),
    coalesce((select sum(qa2.correct * 10) + sum(case when ulp2.completed_at::date = p_date then 10 else 0 end)
              from user_quiz_attempts qa2
              left join user_lesson_progress ulp2 on ulp2.user_id = qa2.user_id
              where qa2.user_id = pc.child_id and qa2.taken_at::date = p_date), 0),
    exists (select 1 from progress where user_id = pc.child_id and last_active_date = p_date)
  from parent_children pc
  left join user_lesson_progress ulp on ulp.user_id = pc.child_id
  left join lessons l on l.id = ulp.lesson_id
  left join user_quiz_attempts uqa on uqa.user_id = pc.child_id
  where pc.is_active = true
  group by pc.child_id
  on conflict (child_id, date) do update
    set minutes_spent     = excluded.minutes_spent,
        lessons_done      = excluded.lessons_done,
        quiz_correct      = excluded.quiz_correct,
        xp_earned         = excluded.xp_earned,
        streak_maintained = excluded.streak_maintained;

  get diagnostics inserted = row_count;
  return inserted;
end $$;
