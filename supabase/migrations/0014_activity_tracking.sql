-- =============================================================================
-- Retention tracking for the 14-day DTM pilot.
--   is_admin           — profiles flag, set true for the founder/dev account so
--                         the retention dashboard can read across all users
--                         without opening profiles/progress to every caller.
--   touch_daily_activity — self-only ping that bumps progress.last_active_date
--                         (and streak, same rule as award_xp) with no XP change.
--                         Called from useActivity.log() on every real event, so
--                         "last active" reflects actual usage, not just quizzes.
--   admin_retention_summary — one row per profile with everything needed to
--                         read the pilot's day-by-day return rate from the
--                         Dev Panel instead of asking each user by hand.
-- =============================================================================

alter table profiles add column if not exists is_admin boolean not null default false;

update profiles set is_admin = true where lower(email) = lower('raxmatovsamandar1507@gmail.com');

create or replace function is_dev_admin()
returns boolean
language sql security definer stable as $$
  select coalesce((select is_admin from profiles where id = auth.uid()), false);
$$;

create or replace function touch_daily_activity(p_user uuid)
returns void
language plpgsql security definer as $$
begin
  if p_user <> auth.uid() then
    raise exception 'not authorized';
  end if;

  insert into progress (user_id, streak, level, last_active_date)
  values (p_user, 1, 1, current_date)
  on conflict (user_id) do update
    set streak = case
                   when progress.last_active_date = current_date     then progress.streak
                   when progress.last_active_date = current_date - 1 then progress.streak + 1
                   else 1
                 end,
        last_active_date = current_date;
end $$;
grant execute on function touch_daily_activity(uuid) to authenticated;

create or replace function admin_retention_summary(p_role user_role default null)
returns table (
  user_id           uuid,
  name              text,
  email             text,
  role              user_role,
  signed_up_at      timestamptz,
  days_since_signup integer,
  last_active_date  date,
  active_today      boolean,
  streak            integer,
  xp                integer
)
language sql security definer stable as $$
  select
    p.id, p.name, p.email, p.role, p.created_at,
    (current_date - p.created_at::date)::int,
    pr.last_active_date,
    pr.last_active_date = current_date,
    coalesce(pr.streak, 0),
    coalesce(pr.xp, 0)
  from profiles p
  left join progress pr on pr.user_id = p.id
  where is_dev_admin()
    and (p_role is null or p.role = p_role)
  order by p.created_at desc;
$$;
grant execute on function admin_retention_summary(user_role) to authenticated;
