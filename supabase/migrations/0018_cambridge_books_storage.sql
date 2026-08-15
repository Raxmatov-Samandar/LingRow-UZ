-- =============================================================================
-- Cambridge Reading books: same real-storage fix as Listening audio (0016)
-- and Lessons (0017). The Dev Panel's Books tab stored the parsed PDF as a
-- base64 data URL in a client-side Zustand store (localStorage) — a book
-- uploaded on the founder's laptop was invisible to every other real user,
-- and Reading.tsx read from that same local-only store. localStorage also
-- caps out around 5-10MB, and a scanned Cambridge PDF alone can be several MB.
--
-- This moves books to a public storage bucket + table, admin-write gated by
-- is_dev_admin() (same helper as 0014/0016/0017). Public read since this is
-- shared exam content, not private user data.
-- =============================================================================

create table cambridge_books (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  kind         text not null default 'cambridge_ielts',
  module       text,                 -- 'AC' | 'GT' | 'unknown'
  source       text,
  pdf_url      text not null,
  pdf_filename text not null,
  pdf_size     bigint not null,
  num_pages    int not null default 0,
  raw_text     text not null default '',
  parts        jsonb not null default '[]'::jsonb,
  warnings     jsonb not null default '[]'::jsonb,
  created_at   timestamptz not null default now()
);

alter table cambridge_books enable row level security;

create policy "cambridge books readable by authenticated"
  on cambridge_books for select
  using (auth.role() = 'authenticated');

create policy "cambridge books admin write"
  on cambridge_books for all
  using (is_dev_admin())
  with check (is_dev_admin());

-- Public bucket: this is shared exam-prep content, not private user data
-- (unlike the private per-user 'speaking' bucket from migration 0012).
insert into storage.buckets (id, name, public)
values ('cambridge-books', 'cambridge-books', true)
on conflict (id) do nothing;

create policy "cambridge books bucket public read"
  on storage.objects for select
  using (bucket_id = 'cambridge-books');

create policy "cambridge books bucket admin write"
  on storage.objects for insert
  with check (bucket_id = 'cambridge-books' and is_dev_admin());

create policy "cambridge books bucket admin delete"
  on storage.objects for delete
  using (bucket_id = 'cambridge-books' and is_dev_admin());
