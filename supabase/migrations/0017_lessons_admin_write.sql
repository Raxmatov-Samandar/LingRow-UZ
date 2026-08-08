-- =============================================================================
-- Same gap as Listening audio (migration 0016), one table over: the Dev
-- Panel's "Lessons" tab wrote video/reading/speaking/writing lessons into a
-- local Zustand store (localStorage) instead of the real `lessons` table
-- that already exists (0001_initial_schema.sql) and that learning.getLevels()
-- already reads from for the Dashboard's level cards. A lesson "published"
-- from the founder's laptop was never visible to any real user's device —
-- Lesson.tsx read from the same local-only store, so it never even reached
-- its own content, let alone anyone else's.
--
-- `lessons` already has a public-read policy for authenticated users
-- (0002_rls_policies.sql: "lessons readable"). This migration adds the
-- missing write side, gated by the same is_dev_admin() used for the
-- retention dashboard and Listening audio.
-- =============================================================================

create policy "lessons admin write"
  on lessons for all
  using (is_dev_admin())
  with check (is_dev_admin());
