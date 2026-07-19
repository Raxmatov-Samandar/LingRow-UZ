-- =============================================================================
-- Fix build_daily_reports(): the original FROM clause joined
-- user_lesson_progress and user_quiz_attempts to parent_children independently
-- (both keyed only on child_id), which cross-joins the two per child whenever
-- a child has more than one row in each table on the same day — every sum/count
-- (minutes_spent, lessons_done, quiz_correct, xp_earned) gets multiplied by the
-- other table's row count instead of reflecting the real total.
--
-- Fix: aggregate each source table per-child in its own CTE first, then join
-- those single-row-per-child aggregates together — no fan-out possible.
-- =============================================================================

create or replace function build_daily_reports(p_date date default current_date)
returns integer
language plpgsql security definer as $$
declare
  inserted integer := 0;
begin
  with lesson_agg as (
    select
      ulp.user_id as child_id,
      coalesce(sum(l.duration_min), 0) as minutes_spent,
      count(*)                          as lessons_done
    from user_lesson_progress ulp
    join lessons l on l.id = ulp.lesson_id
    where ulp.completed_at::date = p_date
    group by ulp.user_id
  ),
  quiz_agg as (
    select
      uqa.user_id as child_id,
      coalesce(sum(uqa.correct), 0)     as quiz_correct,
      coalesce(sum(uqa.correct * 10), 0) as quiz_xp
    from user_quiz_attempts uqa
    where uqa.taken_at::date = p_date
    group by uqa.user_id
  )
  insert into daily_reports
    (child_id, date, minutes_spent, lessons_done, quiz_correct, xp_earned, streak_maintained)
  select distinct
    pc.child_id,
    p_date,
    coalesce(la.minutes_spent, 0),
    coalesce(la.lessons_done, 0),
    coalesce(qa.quiz_correct, 0),
    coalesce(qa.quiz_xp, 0) + coalesce(la.lessons_done, 0) * 10,
    exists (select 1 from progress where user_id = pc.child_id and last_active_date = p_date)
  from parent_children pc
  left join lesson_agg la on la.child_id = pc.child_id
  left join quiz_agg   qa on qa.child_id = pc.child_id
  where pc.is_active = true
  on conflict (child_id, date) do update
    set minutes_spent     = excluded.minutes_spent,
        lessons_done      = excluded.lessons_done,
        quiz_correct      = excluded.quiz_correct,
        xp_earned         = excluded.xp_earned,
        streak_maintained = excluded.streak_maintained;

  get diagnostics inserted = row_count;
  return inserted;
end $$;
