-- =============================================================================
-- LingRow — Initial schema (migrates Plan v2 §3.4 + lessons / vocab / quiz / billing)
-- Run order:
--   0001_initial_schema.sql      (this file)   — tables + indexes
--   0002_rls_policies.sql                       — Row Level Security
--   0003_functions_triggers.sql                  — SM-2 + streak + helpers
--   0004_seed.sql                                — demo data (optional)
-- =============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- 1. profiles  (one row per auth.users row)
-- ---------------------------------------------------------------------------
create type user_role  as enum ('student', 'adult', 'parent');
create type user_plan  as enum ('free', 'kids', 'teen', 'ielts', 'corporate', 'family');

create table profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  name            text not null,
  email           text unique,
  phone           text unique,
  role            user_role not null default 'student',
  age             integer check (age between 6 and 120),
  avatar_url      text,
  plan            user_plan not null default 'free',
  goal            text,                                  -- 'travel'|'school'|'ielts'|'dtm'|'work'
  level           text check (level in ('beginner','intermediate','advanced','mastery')),
  exam_date       date,
  band_target     numeric(2,1) check (band_target between 4.5 and 9),
  daily_minutes   integer not null default 30,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index profiles_role_idx on profiles(role);

-- ---------------------------------------------------------------------------
-- 2. progress  (XP / streak per user)
-- ---------------------------------------------------------------------------
create table progress (
  user_id           uuid primary key references profiles(id) on delete cascade,
  xp                integer not null default 0,
  level             integer not null default 1,
  streak            integer not null default 0,
  last_active_date  date    not null default current_date,
  badges            text[]  not null default '{}',
  updated_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3. lessons / curriculum
-- ---------------------------------------------------------------------------
create type lesson_level as enum ('beginner', 'intermediate', 'advanced', 'mastery');
create type lesson_type  as enum ('video', 'reading', 'speaking', 'writing', 'quiz');

create table lessons (
  id            uuid primary key default uuid_generate_v4(),
  level         lesson_level not null,
  type          lesson_type  not null,
  title         text not null,
  description   text,
  order_index   integer not null default 0,
  duration_min  integer,
  content       jsonb not null default '{}'::jsonb,        -- video url, transcript, body, etc.
  is_published  boolean not null default true,
  created_at    timestamptz not null default now()
);
create index lessons_level_idx on lessons(level, order_index);

create table user_lesson_progress (
  user_id       uuid references profiles(id) on delete cascade,
  lesson_id     uuid references lessons(id)  on delete cascade,
  completed_at  timestamptz,
  score         numeric(5,2),
  attempts      integer not null default 0,
  primary key (user_id, lesson_id)
);

-- ---------------------------------------------------------------------------
-- 4. vocabulary (SM-2 spaced repetition)
-- ---------------------------------------------------------------------------
create table vocab_words (
  id          uuid primary key default uuid_generate_v4(),
  word        text not null,
  phonetic    text,
  definition  text not null,
  example     text,
  level       lesson_level not null,
  unique (word, level)
);

create table user_vocab (
  user_id        uuid references profiles(id) on delete cascade,
  word_id        uuid references vocab_words(id) on delete cascade,
  ease_factor    numeric(4,2) not null default 2.5,
  interval_days  integer      not null default 1,
  repetitions    integer      not null default 0,
  next_review    timestamptz  not null default now(),
  last_quality   integer,                              -- 0-5 SM-2 quality
  primary key (user_id, word_id)
);
create index user_vocab_review_idx on user_vocab(user_id, next_review);

-- ---------------------------------------------------------------------------
-- 5. quizzes
-- ---------------------------------------------------------------------------
create table quiz_questions (
  id             uuid primary key default uuid_generate_v4(),
  lesson_id      uuid references lessons(id) on delete cascade,
  prompt         text not null,
  options        text[] not null,
  correct_index  integer not null check (correct_index >= 0),
  explanation    text,
  order_index    integer not null default 0
);

create table user_quiz_attempts (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references profiles(id) on delete cascade,
  lesson_id     uuid references lessons(id)  on delete cascade,
  score         numeric(5,2) not null,
  total         integer not null,
  correct       integer not null,
  answers       jsonb,
  band_score    numeric(2,1),                            -- IELTS band if applicable
  taken_at      timestamptz not null default now()
);
create index user_quiz_attempts_idx on user_quiz_attempts(user_id, taken_at desc);

-- ---------------------------------------------------------------------------
-- 6. AI feedback (writing / speaking)
-- ---------------------------------------------------------------------------
create type ai_kind as enum ('writing', 'speaking');

create table ai_feedback (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references profiles(id) on delete cascade,
  kind            ai_kind not null,
  prompt          text,
  submission      text,
  audio_url       text,
  score           numeric(5,2),
  accuracy        numeric(5,2),
  fluency         numeric(5,2),
  pronunciation   numeric(5,2),
  feedback        jsonb not null default '{}'::jsonb,    -- { items: [{type, line, suggestion}] }
  model           text default 'claude-haiku-4-5',
  created_at      timestamptz not null default now()
);
create index ai_feedback_user_idx on ai_feedback(user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 7. PARENT MODULE (Plan v2 §3.4)
-- ---------------------------------------------------------------------------

create table parent_profiles (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid unique references profiles(id) on delete cascade,
  phone       text,
  created_at  timestamptz not null default now()
);

create table parent_children (
  id          uuid primary key default uuid_generate_v4(),
  parent_id   uuid references parent_profiles(id) on delete cascade,
  child_id    uuid references profiles(id) on delete cascade,
  link_code   text unique,                       -- 6-digit code
  code_expires_at timestamptz,
  linked_at   timestamptz,
  is_active   boolean not null default false,
  created_at  timestamptz not null default now(),
  unique (parent_id, child_id)
);
create index parent_children_code_idx on parent_children(link_code) where link_code is not null;

create table parental_controls (
  child_id              uuid primary key references profiles(id) on delete cascade,
  daily_limit_mins      integer  not null default 60 check (daily_limit_mins between 0 and 600),
  allowed_from          time     not null default '15:00',
  allowed_to            time     not null default '21:00',
  weekend_only          boolean  not null default false,
  ai_chat_enabled       boolean  not null default false,
  leaderboard_visible   boolean  not null default true,
  notify_daily_summary  boolean  not null default true,
  notify_missed_session boolean  not null default true,
  notify_new_badge      boolean  not null default true,
  updated_at            timestamptz not null default now()
);

create table daily_reports (
  id                 uuid primary key default uuid_generate_v4(),
  child_id           uuid references profiles(id) on delete cascade,
  date               date not null,
  minutes_spent      integer not null default 0,
  lessons_done       integer not null default 0,
  quiz_correct       integer not null default 0,
  xp_earned          integer not null default 0,
  streak_maintained  boolean not null default false,
  band_score_change  numeric(3,2),                       -- + or - from last test
  created_at         timestamptz not null default now(),
  unique (child_id, date)
);
create index daily_reports_idx on daily_reports(child_id, date desc);

-- ---------------------------------------------------------------------------
-- 8. OTP / SMS log
-- ---------------------------------------------------------------------------
create table otp_codes (
  id           uuid primary key default uuid_generate_v4(),
  phone        text not null,
  code_hash    text not null,                            -- bcrypt hash, never store raw
  expires_at   timestamptz not null,
  attempts     integer not null default 0,
  consumed_at  timestamptz,
  created_at   timestamptz not null default now()
);
create index otp_codes_phone_idx on otp_codes(phone, expires_at desc);

create table sms_log (
  id           uuid primary key default uuid_generate_v4(),
  to_phone     text not null,
  body         text not null,
  provider     text not null default 'eskiz',
  status       text,
  cost_uzs     integer,
  sent_at      timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- 9. PAYMENTS  (Payme + Click)
-- ---------------------------------------------------------------------------
create type payment_provider as enum ('payme', 'click', 'uzum', 'manual');
create type payment_status   as enum ('created', 'pending', 'paid', 'cancelled', 'failed', 'refunded');

create table subscriptions (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references profiles(id) on delete cascade,
  plan            user_plan not null,
  current_period_start timestamptz not null default now(),
  current_period_end   timestamptz not null,
  cancel_at_period_end boolean not null default false,
  status          text not null default 'active',
  created_at      timestamptz not null default now()
);
create index subscriptions_user_idx on subscriptions(user_id);

create table payments (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references profiles(id) on delete cascade,
  subscription_id uuid references subscriptions(id) on delete set null,
  provider        payment_provider not null,
  external_id     text,                                  -- transaction id from provider
  amount_uzs      bigint not null,
  status          payment_status not null default 'created',
  raw             jsonb default '{}'::jsonb,             -- full provider payload
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index payments_user_idx on payments(user_id, created_at desc);
create index payments_external_idx on payments(provider, external_id);

-- ---------------------------------------------------------------------------
-- 10. updated_at triggers
-- ---------------------------------------------------------------------------
create or replace function set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger profiles_updated_at         before update on profiles         for each row execute function set_updated_at();
create trigger progress_updated_at         before update on progress         for each row execute function set_updated_at();
create trigger parental_controls_updated_at before update on parental_controls for each row execute function set_updated_at();
create trigger payments_updated_at         before update on payments         for each row execute function set_updated_at();
