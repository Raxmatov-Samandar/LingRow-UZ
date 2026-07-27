-- =============================================================================
-- Uzbek Error DNA — server-side logic.
--   sample_diagnostic_quiz()  — 4 random questions per category (safe columns
--                               only — no correct_index/explanation).
--   check_diagnostic_answer() — reveals one question's answer + explanation,
--                               fetched right after the learner answers it.
--   submit_diagnostic()      — grades a submission against the real answer
--                               key (never sent to the client) and upserts
--                               user_dna_scores + an attempt row.
--   recommended_lessons_for() — orders unfinished lessons by whether they
--                               target the caller's weakest DNA category.
--   weekly_dna_refresh()      — blends in the last 7 days of quiz performance
--                               on category-tagged lessons, so scores move
--                               between full diagnostic retakes instead of
--                               going stale.
--
-- Score direction: 0-100 MASTERY (higher = stronger), not a "problem score".
-- Motivational framing matters here — a learner seeing their weakest area
-- rendered as a big red number reads as "you failed", not "focus here".
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- sample_diagnostic_quiz — security definer so it can read the locked-down
-- diagnostic_questions table, but only ever projects the safe columns.
-- Granted directly to `authenticated` (like sm2_review) since it exposes
-- nothing sensitive — just a random sample of the public question bank.
-- ---------------------------------------------------------------------------
create or replace function sample_diagnostic_quiz(p_per_category int default 4)
returns table (id uuid, category error_category, prompt text, options text[])
language sql security definer as $$
  select ranked.id, ranked.category, ranked.prompt, ranked.options
  from (
    select q.id, q.category, q.prompt, q.options,
           row_number() over (partition by q.category order by random()) as rn
    from diagnostic_questions q
  ) ranked
  where ranked.rn <= p_per_category
  order by random();
$$;
grant execute on function sample_diagnostic_quiz(int) to authenticated;

-- ---------------------------------------------------------------------------
-- check_diagnostic_answer — reveals a single question's answer key. This is
-- a self-paced practice tool (immediate feedback is the intended UX, per the
-- product design), not a proctored exam, so per-question reveal-on-demand is
-- an acceptable trade-off — it still costs a caller one request per question
-- instead of getting the whole key in the initial payload.
-- ---------------------------------------------------------------------------
create or replace function check_diagnostic_answer(p_question_id uuid, p_selected_index int)
returns table (correct boolean, correct_index int, explanation text)
language sql security definer as $$
  select (p_selected_index = q.correct_index), q.correct_index, q.explanation
  from diagnostic_questions q
  where q.id = p_question_id;
$$;
grant execute on function check_diagnostic_answer(uuid, int) to authenticated;

-- ---------------------------------------------------------------------------
-- submit_diagnostic — intentionally NOT granted to `authenticated`. Grading
-- must trust the server's own diagnostic_questions.correct_index, so this is
-- only reachable through the dna-diagnostic edge function (which calls it
-- with the service-role client after verifying the caller via their JWT) —
-- the same pattern build_daily_reports() already uses in this codebase.
-- ---------------------------------------------------------------------------
create or replace function submit_diagnostic(p_user uuid, p_answers jsonb)
returns jsonb
language plpgsql security definer as $$
declare
  v_answer   jsonb;
  v_question diagnostic_questions;
  v_graded   jsonb := '[]'::jsonb;
  v_scores   jsonb := '{}'::jsonb;
  v_cat      error_category;
  v_total    integer;
  v_correct  integer;
begin
  for v_answer in select * from jsonb_array_elements(p_answers)
  loop
    select * into v_question from diagnostic_questions where id = (v_answer->>'question_id')::uuid;
    if not found then
      continue;
    end if;

    v_graded := v_graded || jsonb_build_object(
      'question_id',     v_question.id,
      'category',        v_question.category,
      'selected_index',  (v_answer->>'selected_index')::int,
      'correct',         (v_answer->>'selected_index')::int = v_question.correct_index
    );
  end loop;

  for v_cat in select unnest(enum_range(null::error_category))
  loop
    select count(*) into v_total from jsonb_array_elements(v_graded) g where (g->>'category') = v_cat::text;
    if v_total = 0 then
      continue;
    end if;
    select count(*) into v_correct from jsonb_array_elements(v_graded) g
      where (g->>'category') = v_cat::text and (g->>'correct')::boolean = true;

    v_scores := v_scores || jsonb_build_object(v_cat::text, round(100.0 * v_correct / v_total));

    insert into user_dna_scores (user_id, category, score, updated_at)
    values (p_user, v_cat, round(100.0 * v_correct / v_total), now())
    on conflict (user_id, category) do update
      set score = excluded.score, updated_at = excluded.updated_at;
  end loop;

  insert into user_diagnostic_attempts (user_id, answers, scores)
  values (p_user, v_graded, v_scores);

  return v_scores;
end $$;

-- ---------------------------------------------------------------------------
-- recommended_lessons_for — safe to call directly from the client (like
-- sm2_review/award_xp already are), because it checks the caller's own
-- identity (or parent-of-child access) itself before returning anything.
-- ---------------------------------------------------------------------------
create or replace function recommended_lessons_for(p_user uuid, p_limit int default 10)
returns setof lessons
language plpgsql security definer as $$
begin
  if p_user <> auth.uid() and not is_parent_of(p_user) then
    raise exception 'not authorized';
  end if;

  return query
  select l.*
  from lessons l
  left join user_dna_scores ds
    on ds.user_id = p_user and ds.category = l.target_error_category
  left join user_lesson_progress ulp
    on ulp.user_id = p_user and ulp.lesson_id = l.id
  where l.is_published
    and ulp.completed_at is null
  order by
    coalesce(ds.score, 100) asc,   -- lessons targeting the lowest-mastery category first;
                                    -- untested categories (no row yet) are NOT prioritized
                                    -- over confirmed weak ones, hence the 100 default
    l.level,
    l.order_index
  limit p_limit;
end $$;
grant execute on function recommended_lessons_for(uuid, int) to authenticated;

-- ---------------------------------------------------------------------------
-- weekly_dna_refresh — cron only (see dna-weekly-refresh edge function).
-- Blends prior score (60%) with this week's quiz performance on lessons
-- tagged with a target_error_category (40%), so a user who keeps practising
-- sees their DNA move without needing to retake the full diagnostic.
-- Users with no category-tagged quiz activity in the window are left as-is.
-- ---------------------------------------------------------------------------
create or replace function weekly_dna_refresh()
returns integer
language plpgsql security definer as $$
declare
  updated integer := 0;
begin
  with recent_quiz as (
    select
      uqa.user_id,
      l.target_error_category as category,
      round(100.0 * sum(uqa.correct) / nullif(sum(uqa.total), 0)) as recent_mastery_score
    from user_quiz_attempts uqa
    join lessons l on l.id = uqa.lesson_id
    where l.target_error_category is not null
      and uqa.taken_at > now() - interval '7 days'
    group by uqa.user_id, l.target_error_category
  )
  insert into user_dna_scores (user_id, category, score, updated_at)
  select
    rq.user_id,
    rq.category,
    round(0.6 * coalesce(ds.score, 50) + 0.4 * rq.recent_mastery_score),
    now()
  from recent_quiz rq
  left join user_dna_scores ds on ds.user_id = rq.user_id and ds.category = rq.category
  on conflict (user_id, category) do update
    set score = excluded.score, updated_at = excluded.updated_at;

  get diagnostics updated = row_count;
  return updated;
end $$;
