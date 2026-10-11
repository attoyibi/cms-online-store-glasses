-- =============================================================
--  v5 · 01 · SUSUNAN HALAMAN DEPAN (editor blok)
--
--  Menyimpan susunan blok halaman depan yang diatur dari
--  Admin → Halaman Depan.
--
--  Dua tabel sengaja dipisah:
--    site_pages        → yang TERBIT. Dibaca publik.
--    site_page_drafts  → draft yang sedang diedit. Hanya admin.
--  Draft tidak ditaruh sebagai kolom di site_pages karena RLS bekerja
--  per baris, bukan per kolom — draft akan ikut terbaca publik.
--
--  Jalankan SETELAH v3 (v4 tidak wajib). Aman dijalankan ulang.
--  Situs tetap tampil normal sebelum dan sesudah ini dijalankan: bila
--  belum ada baris terbit, halaman depan memakai susunan bawaan dari
--  kode, yang sama persis dengan tampilan semula.
-- =============================================================

create table if not exists public.site_pages (
  slug         text primary key,
  blocks       jsonb not null default '[]'::jsonb,
  published_at timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint site_pages_slug_check   check (slug ~ '^[a-z0-9-]{1,40}$'),
  constraint site_pages_blocks_array check (jsonb_typeof(blocks) = 'array'),
  -- Batas ukuran agar satu baris tidak membengkak
  constraint site_pages_blocks_size  check (octet_length(blocks::text) <= 300000)
);

create table if not exists public.site_page_drafts (
  slug       text primary key,
  blocks     jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),

  constraint site_page_drafts_slug_check   check (slug ~ '^[a-z0-9-]{1,40}$'),
  constraint site_page_drafts_blocks_array check (jsonb_typeof(blocks) = 'array'),
  constraint site_page_drafts_blocks_size  check (octet_length(blocks::text) <= 300000)
);

-- updated_at otomatis (fungsinya dibuat di v3)
drop trigger if exists site_pages_touch on public.site_pages;
create trigger site_pages_touch before update on public.site_pages
  for each row execute function public.touch_updated_at();

drop trigger if exists site_page_drafts_touch on public.site_page_drafts;
create trigger site_page_drafts_touch before update on public.site_page_drafts
  for each row execute function public.touch_updated_at();

-- -------------------------------------------------------------
-- RLS
-- -------------------------------------------------------------
alter table public.site_pages       enable row level security;
alter table public.site_page_drafts enable row level security;

-- Yang terbit: siapa pun boleh membaca (memang tampil di situs), admin menulis
drop policy if exists "pages public read" on public.site_pages;
create policy "pages public read" on public.site_pages
  for select using (true);

drop policy if exists "pages admin write" on public.site_pages;
create policy "pages admin write" on public.site_pages
  for all using (public.is_admin()) with check (public.is_admin());

-- Draft: hanya admin, baca maupun tulis
drop policy if exists "drafts admin all" on public.site_page_drafts;
create policy "drafts admin all" on public.site_page_drafts
  for all using (public.is_admin()) with check (public.is_admin());

-- -------------------------------------------------------------
insert into public.schema_versions (version, note)
values ('v5', 'Editor blok halaman depan: site_pages (terbit) + site_page_drafts (draft)')
on conflict (version) do nothing;
