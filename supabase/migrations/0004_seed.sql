-- =============================================================================
-- Demo seed data — safe to run in dev only.
-- =============================================================================

-- ---------- Lessons / curriculum ----------
insert into lessons (level, type, title, description, order_index, duration_min, content) values
  ('beginner',     'video',    'Greetings in English',         'Learn basic greetings.', 1, 8, '{"videoUrl":""}'),
  ('beginner',     'reading',  'Daily routine reading',        'Short passage with questions.', 2, 10, '{}'),
  ('beginner',     'speaking', 'Introduce yourself',           'Practice introductions.', 3, 6, '{}'),
  ('beginner',     'writing',  'Write a postcard',             'Short writing prompt.', 4, 12, '{}'),
  ('intermediate', 'video',    'Past tense storytelling',      '', 1, 9,  '{}'),
  ('intermediate', 'reading',  'The key to constant practice', 'Body of text used in Reading page.', 2, 12, '{}'),
  ('advanced',     'writing',  'Argumentative essay',          'Outline + draft', 1, 30, '{}'),
  ('advanced',     'speaking', 'Cue card: technology',         'IELTS-style 2-min talk', 2, 5, '{}'),
  ('mastery',      'quiz',     'Mock IELTS — full reading',    'Cambridge-style', 1, 60, '{}');

-- ---------- Vocab ----------
insert into vocab_words (word, phonetic, definition, example, level) values
  ('Hello',         '/həˈloʊ/',           'A common greeting',         'Hello, how are you?',     'beginner'),
  ('Good morning',  '/ɡʊd ˈmɔːr.nɪŋ/',    'Morning greeting',          'Good morning, teacher!',  'beginner'),
  ('How are you?',  '/haʊ ɑːr juː/',      'A polite question',         'Hi! How are you today?',  'beginner'),
  ('Welcome',       '/ˈwel.kəm/',         'To receive someone warmly', 'Welcome to LingRow!',     'beginner'),
  ('Thank you',     '/θæŋk juː/',         'Expression of gratitude',   'Thank you for helping.',  'beginner'),
  ('Crucial',       '/ˈkruː.ʃəl/',        'Of the greatest importance','Practice is crucial.',    'advanced'),
  ('Pivotal',       '/ˈpɪv.ə.t̬əl/',      'Of vital importance',       'A pivotal moment.',       'advanced'),
  ('Imperative',    '/ɪmˈper.ə.t̬ɪv/',    'Of vital importance',       'It is imperative to act.', 'advanced'),
  ('Ubiquitous',    '/juːˈbɪk.wɪ.t̬əs/',   'Present everywhere',        'Smartphones are ubiquitous.', 'mastery'),
  ('Ephemeral',     '/ɪˈfem.ɚ.əl/',       'Lasting for a very short time','Fame can be ephemeral.', 'mastery');

-- ---------- Quiz on the reading lesson ----------
with rl as (select id from lessons where title = 'The key to constant practice' limit 1)
insert into quiz_questions (lesson_id, prompt, options, correct_index, explanation, order_index)
select rl.id,
       'According to the text, what was the author''s initial focus?',
       array['Speaking','Vocabulary','Grammar','Listening'],
       1,
       'The text states early studies were focused on vocabulary.',
       1
from rl;

with rl as (select id from lessons where title = 'The key to constant practice' limit 1)
insert into quiz_questions (lesson_id, prompt, options, correct_index, order_index)
select rl.id,
       'What insight was described as crucial?',
       array['Practice matters','Speaking and writing are crucial','Grammar is overrated','Listening is enough'],
       1, 2
from rl;

-- ---------- Demo plans (subscriptions) inserted at runtime, not seeded ----------
