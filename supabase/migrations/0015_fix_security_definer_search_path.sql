-- =============================================================================
-- Fix: every security definer function was missing an explicit search_path.
--
-- Without `set search_path`, a security definer function resolves unqualified
-- table names using the CALLING session's search_path, not a fixed one. That's
-- fine when called via PostgREST/RPC as `authenticated` (default search_path
-- "$user", public, extensions — includes public, so it happened to work), but
-- handle_new_user() is called by the on_auth_user_created trigger from GoTrue's
-- own service role, whose default search_path does NOT include public. Result:
-- every real signup failed with "relation \"profiles\" does not exist" even
-- though the table plainly existed — the SQL Editor session (which does have
-- public on its search_path) never saw the problem, which is what made this
-- so confusing to diagnose from the client side.
--
-- Fix applies to every existing security definer function, not just
-- handle_new_user() — same latent bug, different blast radius (edge functions
-- calling via service-role client are not guaranteed the same default
-- search_path as `authenticated` either).
-- =============================================================================

alter function handle_new_user()                                   set search_path = public, extensions;
alter function sm2_review(uuid, uuid, int)                          set search_path = public, extensions;
alter function award_xp(uuid, int)                                  set search_path = public, extensions;
alter function build_daily_reports(date)                            set search_path = public, extensions;
alter function sample_diagnostic_quiz(int)                          set search_path = public, extensions;
alter function check_diagnostic_answer(uuid, int)                   set search_path = public, extensions;
alter function submit_diagnostic(uuid, jsonb)                       set search_path = public, extensions;
alter function recommended_lessons_for(uuid, int)                   set search_path = public, extensions;
alter function weekly_dna_refresh()                                 set search_path = public, extensions;
alter function perform_payment(uuid, text)                          set search_path = public, extensions;
alter function cancel_own_subscription()                            set search_path = public, extensions;
alter function is_dev_admin()                                       set search_path = public, extensions;
alter function touch_daily_activity(uuid)                           set search_path = public, extensions;
alter function admin_retention_summary(user_role)                   set search_path = public, extensions;
