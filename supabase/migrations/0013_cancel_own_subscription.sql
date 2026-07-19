-- =============================================================================
-- Self-service subscription cancellation.
--
-- Granted to `authenticated` (like sm2_review/award_xp/recommended_lessons_for)
-- because it only ever touches the caller's own row — auth.uid() is baked in,
-- not passed as a parameter, so there's no id to spoof.
-- =============================================================================

create or replace function cancel_own_subscription()
returns subscriptions
language plpgsql security definer as $$
declare
  v subscriptions;
begin
  with target as (
    select id from subscriptions
    where user_id = auth.uid() and status = 'active'
    order by current_period_end desc
    limit 1
  )
  update subscriptions s
     set cancel_at_period_end = true
    from target
   where s.id = target.id
  returning s.* into v;

  if v.id is null then
    raise exception 'no active subscription found';
  end if;

  return v;
end $$;
grant execute on function cancel_own_subscription() to authenticated;
