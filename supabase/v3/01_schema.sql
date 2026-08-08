-- =============================================================
--  v3 · 01 · SKEMA LENGKAP (schema + RLS + storage + atribut)
--  CMS Toko Kacamata Online
--
--  File ini menggabungkan seluruh isi v1 (01_schema, 02_rls,
--  03_storage) dan v2 (01_attributes) menjadi SATU file, supaya
--  setup baru cukup copy-paste dua kali: file ini, lalu
--  02_seed.sql. v1/ dan v2/ tetap dibiarkan ada sebagai riwayat —
--  isinya identik secara fungsional dengan file ini.
--
--  Jalankan di Supabase Dashboard → SQL Editor → New query.
--  Aman dijalankan ulang (semua pakai IF NOT EXISTS / OR REPLACE),
--  dan aman juga dijalankan di database yang sebagian sudah berisi
--  tabel dari v1/v2.
--
--  Urutan: 01_schema (file ini) → 02_seed (opsional)
-- =============================================================

create extension if not exists "pgcrypto";

-- -------------------------------------------------------------
-- 0. Pencatat versi skema
--    Dipakai untuk tahu migrasi mana yang sudah dijalankan di
--    proyek ini. Setiap folder versi menambahkan satu baris.
-- -------------------------------------------------------------
create table if not exists public.schema_versions (
  version    text primary key,
  applied_at timestamptz not null default now(),
  note       text
);

-- -------------------------------------------------------------
-- 1. Daftar admin
--    Hanya user yang terdaftar di sini yang boleh menulis ke
--    tabel produk / kategori / atribut / pengaturan.
-- -------------------------------------------------------------
create table if not exists public.admins (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null unique references auth.users (id) on delete cascade,
  email      text not null,
  full_name  text,
  created_at timestamptz not null default now()
);

-- Dipakai di semua policy RLS di bawah. `security definer` supaya
-- pengecekan tidak ikut terkena RLS tabel admins itu sendiri —
-- kalau tidak, policy-nya akan rekursif.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins where user_id = auth.uid()
  );
$$;

-- -------------------------------------------------------------
-- 2. Kategori
-- -------------------------------------------------------------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  description text,
  image_url   text,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists categories_active_sort_idx
  on public.categories (is_active, sort_order);

-- -------------------------------------------------------------
-- 3. Produk
--    lens_width_mm disertakan langsung sejak awal (di v1+v2 lama
--    kolom ini ditambahkan belakangan lewat ALTER TABLE).
-- -------------------------------------------------------------
create table if not exists public.products (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  name             text not null,
  brand            text,
  description      text,
  -- Harga disimpan sebagai rupiah penuh (bukan sen)
  price            integer not null check (price >= 0),
  compare_at_price integer check (compare_at_price >= 0),
  stock            integer not null default 0 check (stock >= 0),
  images           text[] not null default '{}',
  category_id      uuid references public.categories (id) on delete set null,
  is_active        boolean not null default true,
  is_featured      boolean not null default false,
  -- Lebar satu lensa dalam mm. Dipakai filter ukuran di katalog;
  -- null untuk produk non-frame seperti lensa lepas.
  lens_width_mm    integer check (lens_width_mm is null or (lens_width_mm between 30 and 80)),
  specs            jsonb not null default '{}'::jsonb,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  -- Harga coret harus lebih besar dari harga jual bila diisi
  constraint products_compare_price_check
    check (compare_at_price is null or compare_at_price > price)
);

create index if not exists products_active_created_idx
  on public.products (is_active, created_at desc);

create index if not exists products_category_idx
  on public.products (category_id);

create index if not exists products_featured_idx
  on public.products (is_featured) where is_featured;

create index if not exists products_lens_width_idx
  on public.products (lens_width_mm);

-- Merek tetap kolom teks biasa, bukan tabel pilihan. Di form admin
-- kolom ini diberi daftar saran berisi merek yang sudah dipakai,
-- supaya tidak muncul ejaan yang berbeda-beda untuk merek yang sama.
create index if not exists products_brand_idx
  on public.products (brand);

-- -------------------------------------------------------------
-- 4. Atribut produk (untuk filter katalog)
--    Kenapa tabel sendiri, bukan sekadar teks di kolom specs:
--    "Asetat premium", "asetat", dan "Acetate" akan jadi tiga opsi
--    filter berbeda untuk barang yang sama kalau ditulis bebas.
--    Di sini admin MEMILIH dari daftar, bukan mengetik. Opsi baru
--    tetap bisa ditambah lewat halaman /admin/atribut kapan saja.
--
--    Kolom specs pada tabel products tidak digantikan oleh ini —
--    specs tetap dipakai untuk detail yang hanya ditampilkan dan
--    tidak perlu difilter (mis. panjang gagang, berat).
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

-- Relasi many-to-many: satu frame boleh punya lebih dari satu
-- material (mis. "asetat + metal") dan lebih dari satu warna.
create table if not exists public.product_attribute_links (
  product_id   uuid not null references public.products (id) on delete cascade,
  attribute_id uuid not null references public.product_attributes (id) on delete cascade,
  primary key (product_id, attribute_id)
);

create index if not exists product_attribute_links_attr_idx
  on public.product_attribute_links (attribute_id);

-- -------------------------------------------------------------
-- 5. Pengaturan toko (baris tunggal)
-- -------------------------------------------------------------
create table if not exists public.store_settings (
  id              uuid primary key default gen_random_uuid(),
  store_name      text not null default 'Lensara',
  whatsapp_number text not null default '6289679165530',
  address         text,
  email           text,
  instagram_url   text,
  open_hours      text,
  announcement    text,
  updated_at      timestamptz not null default now()
);

-- Index unik pada ekspresi konstan → tabel ini tidak akan pernah
-- punya lebih dari satu baris.
create unique index if not exists store_settings_singleton_idx
  on public.store_settings ((true));

insert into public.store_settings
  (store_name, whatsapp_number, address, email, open_hours)
select 'Lensara',
       '6289679165530',
       'Jl. Kaliurang KM 5, Sleman, Daerah Istimewa Yogyakarta',
       'halo@lensara.id',
       'Setiap hari, 09.00 - 21.00 WIB'
where not exists (select 1 from public.store_settings);

-- -------------------------------------------------------------
-- 6. Trigger updated_at
-- -------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists categories_touch on public.categories;
create trigger categories_touch before update on public.categories
  for each row execute function public.touch_updated_at();

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

drop trigger if exists store_settings_touch on public.store_settings;
create trigger store_settings_touch before update on public.store_settings
  for each row execute function public.touch_updated_at();

-- -------------------------------------------------------------
-- 7. Row Level Security
--    Aturannya sederhana di semua tabel:
--      · Publik  → hanya boleh MEMBACA baris yang is_active = true
--      · Admin   → boleh baca & tulis semuanya
--    "Admin" ditentukan oleh public.is_admin() di atas.
-- -------------------------------------------------------------
alter table public.admins                  enable row level security;
alter table public.categories              enable row level security;
alter table public.products                enable row level security;
alter table public.product_attributes      enable row level security;
alter table public.product_attribute_links enable row level security;
alter table public.store_settings          enable row level security;
alter table public.schema_versions         enable row level security;

-- admins — tiap admin hanya bisa melihat barisnya sendiri.
-- Tidak ada policy INSERT/UPDATE: penambahan admin dilakukan
-- manual lewat SQL Editor (lihat supabase/README.md).
drop policy if exists "admins read own row" on public.admins;
create policy "admins read own row" on public.admins
  for select using (user_id = auth.uid());

-- categories
drop policy if exists "categories public read" on public.categories;
create policy "categories public read" on public.categories
  for select using (is_active or public.is_admin());

drop policy if exists "categories admin write" on public.categories;
create policy "categories admin write" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- products
drop policy if exists "products public read" on public.products;
create policy "products public read" on public.products
  for select using (is_active or public.is_admin());

drop policy if exists "products admin write" on public.products;
create policy "products admin write" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- product_attributes
drop policy if exists "attributes public read" on public.product_attributes;
create policy "attributes public read" on public.product_attributes
  for select using (is_active or public.is_admin());

drop policy if exists "attributes admin write" on public.product_attributes;
create policy "attributes admin write" on public.product_attributes
  for all using (public.is_admin()) with check (public.is_admin());

-- product_attribute_links
drop policy if exists "attribute links public read" on public.product_attribute_links;
create policy "attribute links public read" on public.product_attribute_links
  for select using (true);

drop policy if exists "attribute links admin write" on public.product_attribute_links;
create policy "attribute links admin write" on public.product_attribute_links
  for all using (public.is_admin()) with check (public.is_admin());

-- store_settings — nomor WhatsApp & alamat memang tampil di
-- footer situs, jadi boleh dibaca siapa saja.
drop policy if exists "settings public read" on public.store_settings;
create policy "settings public read" on public.store_settings
  for select using (true);

drop policy if exists "settings admin write" on public.store_settings;
create policy "settings admin write" on public.store_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- schema_versions — hanya admin yang perlu tahu isinya
drop policy if exists "versions admin read" on public.schema_versions;
create policy "versions admin read" on public.schema_versions
  for select using (public.is_admin());

-- -------------------------------------------------------------
-- 8. Storage — bucket foto produk
--    Diunggah dari halaman admin (komponen ImageUploader). Bucket
--    dibuat publik agar URL-nya bisa langsung dipakai <Image>
--    tanpa signed URL.
-- -------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Siapa pun boleh melihat gambarnya (memang tampil di katalog)
drop policy if exists "product images public read" on storage.objects;
create policy "product images public read" on storage.objects
  for select using (bucket_id = 'product-images');

-- Hanya admin yang boleh unggah, ganti, dan hapus
drop policy if exists "product images admin write" on storage.objects;
create policy "product images admin write" on storage.objects
  for all
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

-- -------------------------------------------------------------
-- 9. Catat versi
--    Ditulis sebagai v1, v2, dan v3 sekaligus — isi file ini
--    secara fungsional setara dengan menjalankan ketiganya.
-- -------------------------------------------------------------
insert into public.schema_versions (version, note)
values
  ('v1', 'Skema awal: admins, categories, products, store_settings'),
  ('v2', 'Atribut produk terstruktur (bentuk/material/warna) + lebar lensa untuk filter'),
  ('v3', 'Bundel konsolidasi v1+v2 dalam satu file, untuk setup baru')
on conflict (version) do nothing;
