-- =============================================================================
-- Create the "speaking" storage bucket as a real migration instead of the
-- manual SQL snippet in BACKEND.md §4 — a step that's easy to forget on a
-- fresh environment, and grade-speaking's storage.upload() 500s every time
-- until someone remembers to run it by hand.
-- =============================================================================

insert into storage.buckets (id, name, public)
values ('speaking', 'speaking', false)
on conflict (id) do nothing;

create policy "speaking own files"
on storage.objects for select
using (bucket_id = 'speaking' and (storage.foldername(name))[1] = auth.uid()::text);
