-- =============================================================================
-- Atomic payment completion.
--
-- payme-merchant's PerformTransaction and click-merchant's "Complete" step
-- both used to do 3 separate writes (payments update, subscriptions insert,
-- profiles update) as independent Supabase calls. If the edge function died
-- between any two of those — a timeout, a cold-start kill, a crash — the
-- payment could end up marked "paid" with no subscription row, or a
-- subscription created but the profile's plan never updated.
--
-- A Postgres function runs in an implicit transaction: if anything inside
-- raises, every write it made rolls back together. Not granted to
-- `authenticated` — only the merchant edge functions (via the service-role
-- client) call this, after their own signature/auth checks pass.
-- =============================================================================

create or replace function perform_payment(p_payment_id uuid, p_plan text)
returns void
language plpgsql security definer as $$
declare
  v_user uuid;
begin
  select user_id into v_user from payments where id = p_payment_id;
  if v_user is null then
    raise exception 'payment % not found', p_payment_id;
  end if;

  update payments set status = 'paid', updated_at = now() where id = p_payment_id;

  insert into subscriptions (user_id, plan, current_period_end)
  values (v_user, p_plan::user_plan, now() + interval '30 days');

  update profiles set plan = p_plan::user_plan where id = v_user;
end $$;
