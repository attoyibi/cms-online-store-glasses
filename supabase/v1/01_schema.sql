-- =============================================================
--  v1 · 01 · SKEMA DATABASE
--  CMS Toko Kacamata Online
--
--  Jalankan di Supabase Dashboard → SQL Editor → New query.
--  Aman dijalankan ulang (semua pakai IF NOT EXISTS / OR REPLACE).
--
--  Urutan: 01_schema → 02_rls → 03_storage → 04_seed
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
--    tabel produk / kategori / pengaturan.
-- -------------------------------------------------------------
create table if not exists public.admins (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null unique references auth.users (id) on delete cascade,
  email      text not null,
  full_name  text,
  created_at timestamptz not null default now()
);

-- Dipakai di dalam policy RLS (lihat 02_rls.sql).
-- `security definer` supaya pengecekan tidak ikut terkena RLS tabel
-- admins itu sendiri — kalau tidak, policy-nya akan rekursif.
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

-- -------------------------------------------------------------
-- 4. Pengaturan toko (baris tunggal)
-- -------------------------------------------------------------
create table if not exists public.store_settings (
  id              uuid primary key default gen_random_uuid(),
  store_name      text not null default 'Lensara',
  whatsapp_number text not null default '6281234567890',
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
       '6281234567890',
       'Jl. Kaliurang KM 5, Sleman, Daerah Istimewa Yogyakarta',
       'halo@lensara.id',
       'Setiap hari, 09.00 - 21.00 WIB'
where not exists (select 1 from public.store_settings);

-- -------------------------------------------------------------
-- 5. Trigger updated_at
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
-- 6. Catat versi
-- -------------------------------------------------------------
insert into public.schema_versions (version, note)
values ('v1', 'Skema awal: admins, categories, products, store_settings')
on conflict (version) do nothing;
