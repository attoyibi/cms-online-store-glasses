-- =============================================================
--  v2 · 01 · ATRIBUT PRODUK (untuk filter katalog)
--
--  Kenapa perlu tabel sendiri:
--  Sampai v1, detail produk hanya disimpan di kolom `specs` (JSON
--  bebas). Bagus untuk ditampilkan, tapi tidak bisa dipakai filter —
--  "Asetat premium", "asetat", dan "Acetate" akan jadi tiga opsi
--  filter berbeda untuk barang yang sama.
--
--  Solusinya: daftar nilai yang boleh dipakai disimpan di tabel,
--  dan admin MEMILIH dari daftar itu, bukan mengetik bebas. Opsi
--  baru tetap bisa ditambah lewat CMS tanpa perlu migrasi SQL.
--
--  Kolom `specs` tetap ada dan tidak berubah — dipakai untuk detail
--  yang cuma ditampilkan dan tidak difilter.
--
--  Prasyarat: v1 sudah dijalankan.
--  Aman dijalankan ulang.
-- =============================================================

-- -------------------------------------------------------------
-- 1. Daftar nilai atribut
--    Satu tabel untuk semua jenis, dibedakan kolom `type`.
--    Lebih ringkas daripada tabel terpisah per jenis, dan
--    menambah jenis baru nanti cukup menambah nilai di CHECK.
-- -------------------------------------------------------------
create table if not exists public.product_attributes (
  id         uuid primary key default gen_random_uuid(),
  type       text not null check (type in ('bentuk', 'material', 'warna')),
  slug       text not null,
  name       text not null,
  -- Untuk warna: kode hex agar bisa ditampilkan sebagai bulatan warna
  swatch_hex text,
  sort_order integer not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  unique (type, slug)
);

create index if not exists product_attributes_type_idx
  on public.product_attributes (type, sort_order);

-- -------------------------------------------------------------
-- 2. Relasi produk ↔ atribut
--    Many-to-many karena satu frame bisa punya lebih dari satu
--    material (mis. "asetat + metal") dan lebih dari satu warna.
-- -------------------------------------------------------------
create table if not exists public.product_attribute_links (
  product_id   uuid not null references public.products (id) on delete cascade,
  attribute_id uuid not null references public.product_attributes (id) on delete cascade,
  primary key (product_id, attribute_id)
);

create index if not exists product_attribute_links_attr_idx
  on public.product_attribute_links (attribute_id);

-- -------------------------------------------------------------
-- 3. Lebar lensa
--    Disimpan sebagai angka (mm), bukan teks, supaya bisa
--    difilter per rentang. Pengelompokan sempit/sedang/lebar
--    dilakukan di aplikasi agar batasnya mudah diubah.
-- -------------------------------------------------------------
alter table public.products
  add column if not exists lens_width_mm integer
    check (lens_width_mm is null or (lens_width_mm between 30 and 80));

create index if not exists products_lens_width_idx
  on public.products (lens_width_mm);

-- Merek tetap kolom teks biasa (sudah ada sejak v1). Di form admin
-- kolom ini diberi daftar saran berisi merek yang sudah dipakai,
-- supaya tidak muncul ejaan yang berbeda-beda.
create index if not exists products_brand_idx
  on public.products (brand);

-- -------------------------------------------------------------
-- 4. Row Level Security
--    Sama seperti tabel lain: publik baca, admin tulis.
-- -------------------------------------------------------------
alter table public.product_attributes      enable row level security;
alter table public.product_attribute_links enable row level security;

drop policy if exists "attributes public read" on public.product_attributes;
create policy "attributes public read" on public.product_attributes
  for select using (is_active or public.is_admin());

drop policy if exists "attributes admin write" on public.product_attributes;
create policy "attributes admin write" on public.product_attributes
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "attribute links public read" on public.product_attribute_links;
create policy "attribute links public read" on public.product_attribute_links
  for select using (true);

drop policy if exists "attribute links admin write" on public.product_attribute_links;
create policy "attribute links admin write" on public.product_attribute_links
  for all using (public.is_admin()) with check (public.is_admin());

-- -------------------------------------------------------------
-- 5. Catat versi
-- -------------------------------------------------------------
insert into public.schema_versions (version, note)
values ('v2', 'Atribut produk terstruktur (bentuk/material/warna) + lebar lensa untuk filter')
on conflict (version) do nothing;
