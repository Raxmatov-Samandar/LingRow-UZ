-- =============================================================================
-- Listening audio: real storage instead of base64-in-localStorage.
--
-- The Dev Panel's Audio tab was uploading MP3s as base64 data URLs into a
-- client-side Zustand store (localStorage). Two real problems: localStorage
-- caps out around 5-10MB (a single 3-4 min MP3 is already 3-5MB — two or
-- three uploads and it breaks), and it's per-browser — a file uploaded on
-- the founder's laptop was never visible to any other device, so it never
-- actually reached real pilot users. Listening.tsx never even read from that
-- store; it expected static files manually placed in /public/audio/.
--
-- This closes the loop: uploads go to a public storage bucket + a slot→url
-- table, and Listening.tsx (migration follow-up in code) reads from it with
-- a fallback to the static path so nothing breaks before the first upload.
-- =============================================================================

create table listening_audio (
  slot        text primary key,        -- e.g. 'c18-t1-p1' — matches the static /public/audio/<slot>.mp3 naming
  url         text not null,
  filename    text not null,
  size_bytes  bigint not null,
  uploaded_at timestamptz not null default now()
);

alter table listening_audio enable row level security;

create policy "listening audio readable by authenticated"
  on listening_audio for select
  using (auth.role() = 'authenticated');

create policy "listening audio admin write"
  on listening_audio for all
  using (is_dev_admin())
  with check (is_dev_admin());

-- Public bucket: this is shared exam-prep content, not private user data
-- (unlike the private per-user 'speaking' bucket from migration 0012).
insert into storage.buckets (id, name, public)
values ('listening-audio', 'listening-audio', true)
on conflict (id) do nothing;

create policy "listening audio bucket public read"
  on storage.objects for select
  using (bucket_id = 'listening-audio');

create policy "listening audio bucket admin write"
  on storage.objects for insert
  with check (bucket_id = 'listening-audio' and is_dev_admin());

create policy "listening audio bucket admin delete"
  on storage.objects for delete
  using (bucket_id = 'listening-audio' and is_dev_admin());
