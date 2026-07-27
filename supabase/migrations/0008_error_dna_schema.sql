-- =============================================================================
-- Uzbek Error DNA — schema.
--   error_catalog             — the reference catalog of Uzbek-L1 English errors
--   diagnostic_questions      — the question bank (5 categories x 8 questions);
--                                each attempt samples 4 per category (20 total),
--                                reshuffled, so retakes don't repeat the same set.
--   user_diagnostic_attempts  — one row per completed diagnostic test
--   user_dna_scores           — the current per-category mastery score (0-100,
--                                higher = stronger), recomputed after each
--                                attempt and by the weekly refresh cron.
--   lessons.target_error_category — lets the curriculum generator prioritize
--                                lessons that address the learner's weakest areas.
-- =============================================================================

create type error_category as enum ('articles', 'prepositions', 'tense', 'word_order', 'vocabulary');

-- ---------------------------------------------------------------------------
-- error_catalog — reference material shown to the learner as "why this
-- happens" / study reference. No secret data, so it's openly readable like
-- lessons/vocab_words/quiz_questions.
-- ---------------------------------------------------------------------------
create table error_catalog (
  id                uuid primary key default uuid_generate_v4(),
  category          error_category not null,
  wrong_example     text not null,
  correct_example   text not null,
  uzbek_root_cause  text not null,     -- why an Uzbek-L1 speaker tends to make this mistake
  explanation       text,
  order_index       integer not null default 0,
  created_at        timestamptz not null default now()
);
create index error_catalog_category_idx on error_catalog(category, order_index);

alter table error_catalog enable row level security;
create policy "error catalog readable" on error_catalog for select using (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- diagnostic_questions — unlike error_catalog, this table's correct_index and
-- explanation are the answer key and must never be bulk-readable by the
-- client taking the test. RLS on the base table stays fully locked down (no
-- select policy for authenticated at all); sample_diagnostic_quiz() and
-- check_diagnostic_answer() (0010 migration) are the only sanctioned reads —
-- both security definer, so they run with the owner's privileges and bypass
-- this table's RLS, while only ever returning the safe columns each needs.
-- ---------------------------------------------------------------------------
create table diagnostic_questions (
  id             uuid primary key default uuid_generate_v4(),
  category       error_category not null,
  prompt         text not null,
  options        text[] not null,
  correct_index  integer not null check (correct_index >= 0),
  explanation    text,
  order_index    integer not null default 0
);
create index diagnostic_questions_category_idx on diagnostic_questions(category, order_index);

alter table diagnostic_questions enable row level security;
-- (intentionally no select policy — the base table is not directly queryable)

-- ---------------------------------------------------------------------------
-- user_diagnostic_attempts / user_dna_scores — both are written only by the
-- security-definer submit_diagnostic() function (0010 migration); clients
-- get read-only access to their own (or, for parents, their child's) rows.
-- ---------------------------------------------------------------------------
create table user_diagnostic_attempts (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references profiles(id) on delete cascade,
  answers    jsonb not null,      -- [{question_id, selected_index, correct}]
  scores     jsonb not null,      -- {category: 0-100 problem score} snapshot at this attempt
  taken_at   timestamptz not null default now()
);
create index user_diagnostic_attempts_idx on user_diagnostic_attempts(user_id, taken_at desc);

alter table user_diagnostic_attempts enable row level security;
create policy "diagnostic attempts self" on user_diagnostic_attempts
  for select using (user_id = auth.uid() or is_parent_of(user_id));

create table user_dna_scores (
  user_id     uuid references profiles(id) on delete cascade,
  category    error_category not null,
  score       integer not null check (score between 0 and 100),
  updated_at  timestamptz not null default now(),
  primary key (user_id, category)
);

alter table user_dna_scores enable row level security;
create policy "dna scores self" on user_dna_scores
  for select using (user_id = auth.uid() or is_parent_of(user_id));

-- ---------------------------------------------------------------------------
-- Curriculum hook: which error category (if any) a lesson targets.
-- ---------------------------------------------------------------------------
alter table lessons add column target_error_category error_category;
