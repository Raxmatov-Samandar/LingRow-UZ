-- =============================================================================
-- Guard against duplicate payment rows for the same provider transaction.
--
-- Payme/Click both retry their webhooks over flaky networks — that's expected
-- protocol behaviour, not an edge case. Without a DB-level constraint, two
-- concurrent CreateTransaction calls can both pass the "does a row already
-- exist?" check before either insert lands, producing two rows for one
-- transaction id. Every later lookup that assumes at most one row
-- (.maybeSingle()/.single()) then breaks.
--
-- external_id is nullable (Click creates the payments row before Prepare
-- assigns a click_trans_id), and Postgres treats every NULL as distinct in a
-- unique index, so pending Click rows with external_id still null are
-- unaffected.
-- =============================================================================

alter table payments
  add constraint payments_provider_external_id_key unique (provider, external_id);
