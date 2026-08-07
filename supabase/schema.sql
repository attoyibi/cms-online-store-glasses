-- =============================================================
-- Skema database CMS Toko Kacamata Online
-- Jalankan di Supabase Dashboard → SQL Editor → New query
-- =============================================================

create extension if not exists "pgcrypto";

-- -------------------------------------------------------------
-- 1. Daftar admin
--    Hanya user yang emailnya terdaftar di sini yang boleh
--    menulis ke tabel produk/kategori/pengaturan.
-- -------------------------------------------------------------
create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz not null default now()
);

-- Dipakai di dalam policy. `security definer` agar pengecekan tidak
-- ikut terkena RLS tabel admins itu sendiri (mencegah rekursi).
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
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists categories_active_sort_idx
  on public.categories (is_active, sort_order);

-- -------------------------------------------------------------
-- 3. Produk
-- -------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  brand text,
  description text,
  -- Harga disimpan sebagai rupiah penuh (bukan sen)
  price integer not null check (price >= 0),
  compare_at_price integer check (compare_at_price >= 0),
  stock integer not null default 0 check (stock >= 0),
  images text[] not null default '{}',
  category_id uuid references public.categories (id) on delete set null,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  specs jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
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
  id uuid primary key default gen_random_uuid(),
  store_name text not null default 'Lensara',
  whatsapp_number text not null default '6281234567890',
  address text,
  email text,
  instagram_url text,
  open_hours text,
  announcement text,
  updated_at timestamptz not null default now()
);

-- Kunci agar tabel ini tidak pernah punya lebih dari satu baris
create unique index if not exists store_settings_singleton_idx
  on public.store_settings ((true));

insert into public.store_settings (store_name, whatsapp_number, address, email, open_hours)
select 'Lensara', '6281234567890',
       'Jl. Kaliurang KM 5, Sleman, Daerah Istimewa Yogyakarta',
       'halo@lensara.id', 'Setiap hari, 09.00 - 21.00 WIB'
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
-- 6. Row Level Security
--    Publik boleh membaca data aktif; hanya admin boleh menulis.
-- -------------------------------------------------------------
alter table public.admins enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.store_settings enable row level security;

-- admins: hanya bisa melihat barisnya sendiri
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

-- store_settings
drop policy if exists "settings public read" on public.store_settings;
create policy "settings public read" on public.store_settings
  for select using (true);

drop policy if exists "settings admin write" on public.store_settings;
create policy "settings admin write" on public.store_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- -------------------------------------------------------------
-- 7. Storage bucket untuk foto produk
-- -------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "product images public read" on storage.objects;
create policy "product images public read" on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists "product images admin write" on storage.objects;
create policy "product images admin write" on storage.objects
  for all using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());
