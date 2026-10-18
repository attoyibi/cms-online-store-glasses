-- =============================================================
--  SETUP SUPABASE — SATU FILE UNTUK SEMUANYA
--  CMS Toko Kacamata Online
--
--  Cara pakai (toko baru ATAU pembaruan toko lama):
--    Supabase Dashboard → SQL Editor → New query → tempel isi
--    file ini → Run. Selesai.
--
--  Aman dijalankan BERULANG KALI, kapan pun:
--    · Database kosong  → semuanya dibuat dari nol.
--    · Database lama    → hanya menambah yang kurang. Data
--                         (produk, kategori, pengaturan, halaman,
--                         foto) TIDAK disentuh.
--  Setiap pembaruan aplikasi yang butuh perubahan database akan
--  ditambahkan ke file ini; cukup jalankan lagi.
--
--  Isinya (menggabungkan v1–v5 yang dulu terpisah):
--    1  pencatat versi          7  varian produk
--    2  admin + is_admin()      8  halaman depan (terbit + draft)
--    3  kategori               8b  pengaturan SEO & bisnis lokal
--                              8c  SEO per halaman statis
--                              8d  pengalihan alamat (redirect 301)
--    4  produk                  9  trigger updated_at
--    5  atribut filter         10  Row Level Security (RLS)
--    6  pengaturan toko        11  penyimpanan foto
--                              12  pencatatan versi + ringkasan
--
--  TIDAK ada data toko siapa pun di file ini. Pengaturan toko
--  (nama, WhatsApp, alamat) diisi dari Admin → Pengaturan.
--  Data contoh ada di file terpisah: seed-demo.sql (opsional).
--
--  Langkah setelah file ini dijalankan, KHUSUS toko baru:
--    1. Authentication → Users → Add user (email + password;
--       centang "Auto Confirm User").
--    2. Daftarkan akun itu sebagai admin — lihat bagian 13 di
--       bawah. Tanpa ini login berhasil, tapi semua data ditolak.
--    3. Authentication → Sign In / Providers → matikan
--       "Allow new users to sign up".
-- =============================================================

create extension if not exists "pgcrypto";

-- -------------------------------------------------------------
-- 1. Pencatat versi skema
--    Menandai perubahan mana yang sudah ada di proyek ini.
-- -------------------------------------------------------------
create table if not exists public.schema_versions (
  version    text primary key,
  applied_at timestamptz not null default now(),
  note       text
);

-- -------------------------------------------------------------
-- 2. Daftar admin
--    Hanya user yang terdaftar di sini yang boleh menulis ke
--    produk / kategori / atribut / pengaturan / halaman.
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
-- 3. Kategori
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
-- 4. Produk
-- -------------------------------------------------------------
create table if not exists public.products (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  name             text not null,
  brand            text,
  description      text,
  -- Harga disimpan sebagai rupiah penuh (bukan sen). Untuk produk
  -- BERVARIAN diisi harga termurah oleh aplikasi (lihat bagian 7).
  price            integer not null check (price >= 0),
  compare_at_price integer check (compare_at_price >= 0),
  stock            integer not null default 0 check (stock >= 0),
  images           text[] not null default '{}',
  category_id      uuid references public.categories (id) on delete set null,
  is_active        boolean not null default true,
  is_featured      boolean not null default false,
  -- Lebar satu lensa dalam mm, untuk filter ukuran; null untuk non-frame
  lens_width_mm    integer check (lens_width_mm is null or (lens_width_mm between 30 and 80)),
  specs            jsonb not null default '{}'::jsonb,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  -- Harga coret harus lebih besar dari harga jual bila diisi
  constraint products_compare_price_check
    check (compare_at_price is null or compare_at_price > price)
);

-- Untuk database yang dulu dibuat dari v1 (kolom ini belum ada)
alter table public.products
  add column if not exists lens_width_mm integer
    check (lens_width_mm is null or (lens_width_mm between 30 and 80));

-- SEO per produk dan per kategori (v8). Kosong = judul dan deskripsi
-- dibuat otomatis dari nama dan deskripsi produk/kategori.
alter table public.products
  add column if not exists seo_title text
    check (seo_title is null or char_length(seo_title) <= 70);
alter table public.products
  add column if not exists seo_description text
    check (seo_description is null or char_length(seo_description) <= 200);
alter table public.categories
  add column if not exists seo_title text
    check (seo_title is null or char_length(seo_title) <= 70);
alter table public.categories
  add column if not exists seo_description text
    check (seo_description is null or char_length(seo_description) <= 200);

-- Teks alternatif foto (v9): peta { "url foto": "teks" }. Foto tanpa teks
-- memakai nama produk. Peta, bukan daftar paralel, supaya mengurutkan ulang
-- foto tidak menggeser teksnya.
alter table public.products
  add column if not exists image_alts jsonb not null default '{}'::jsonb
    check (
      jsonb_typeof(image_alts) = 'object'
      and octet_length(image_alts::text) <= 20000
    );

create index if not exists products_active_created_idx
  on public.products (is_active, created_at desc);

create index if not exists products_category_idx
  on public.products (category_id);

create index if not exists products_featured_idx
  on public.products (is_featured) where is_featured;

create index if not exists products_lens_width_idx
  on public.products (lens_width_mm);

-- Merek tetap teks biasa; form admin memberi saran dari merek yang
-- sudah ada supaya ejaannya konsisten.
create index if not exists products_brand_idx
  on public.products (brand);

-- -------------------------------------------------------------
-- 5. Atribut produk (untuk filter katalog)
--    Admin MEMILIH dari daftar, bukan mengetik bebas, supaya
--    "Asetat", "asetat", dan "Acetate" tidak jadi tiga filter.
-- -------------------------------------------------------------
create table if not exists public.product_attributes (
  id         uuid primary key default gen_random_uuid(),
  type       text not null check (type in ('bentuk', 'material', 'warna')),
  slug       text not null,
  name       text not null,
  -- Untuk warna: kode hex agar tampil sebagai bulatan warna
  swatch_hex text,
  sort_order integer not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  unique (type, slug)
);

create index if not exists product_attributes_type_idx
  on public.product_attributes (type, sort_order);

-- Many-to-many: satu frame boleh punya beberapa material dan warna
create table if not exists public.product_attribute_links (
  product_id   uuid not null references public.products (id) on delete cascade,
  attribute_id uuid not null references public.product_attributes (id) on delete cascade,
  primary key (product_id, attribute_id)
);

create index if not exists product_attribute_links_attr_idx
  on public.product_attribute_links (attribute_id);

-- -------------------------------------------------------------
-- 6. Pengaturan toko (baris tunggal)
--    Baris pertama dibuat dari Admin → Pengaturan. Selama belum
--    ada, aplikasi memakai nilai bawaan dari konfigurasinya.
-- -------------------------------------------------------------
create table if not exists public.store_settings (
  id              uuid primary key default gen_random_uuid(),
  store_name      text not null default 'Toko Saya',
  whatsapp_number text not null default '',
  address         text,
  email           text,
  instagram_url   text,
  open_hours      text,
  announcement    text,
  updated_at      timestamptz not null default now()
);

-- Tema warna (v10): id tema + penyesuaian per slot, mis.
-- {"primary": "#1e4f9c"}. Daftar tema ada di aplikasi (src/lib/themes.ts),
-- jadi menambah tema tidak perlu SQL. Kosong = tema bawaan (jade).
alter table public.store_settings
  add column if not exists theme text
    check (theme is null or char_length(theme) <= 30);
alter table public.store_settings
  add column if not exists theme_colors jsonb not null default '{}'::jsonb
    check (
      jsonb_typeof(theme_colors) = 'object'
      and octet_length(theme_colors::text) <= 2000
    );

-- Tata letak (v11): id tata letak halaman depan, mis. "klasik". Daftarnya ada
-- di aplikasi (src/lib/layouts.ts). Kosong = tata letak bawaan (klasik).
alter table public.store_settings
  add column if not exists layout text
    check (layout is null or char_length(layout) <= 30);

-- Index unik pada ekspresi konstan → tabel ini tak pernah punya
-- lebih dari satu baris.
create unique index if not exists store_settings_singleton_idx
  on public.store_settings ((true));

-- -------------------------------------------------------------
-- 7. Varian produk
--    Satu produk bisa punya beberapa pilihan dengan harga dan
--    stok sendiri, mis. ukuran lensa. Produk tanpa varian memakai
--    harga dan stoknya sendiri.
-- -------------------------------------------------------------
create table if not exists public.product_variants (
  id               uuid primary key default gen_random_uuid(),
  product_id       uuid not null references public.products (id) on delete cascade,
  label            text not null,
  price            integer not null check (price >= 0),
  compare_at_price integer check (compare_at_price >= 0),
  stock            integer not null default 0 check (stock >= 0),
  sort_order       integer not null default 0,
  created_at       timestamptz not null default now(),

  constraint product_variants_compare_price_check
    check (compare_at_price is null or compare_at_price > price),
  -- Dua varian berlabel sama pada satu produk tidak diperbolehkan
  constraint product_variants_label_unique unique (product_id, label)
);

create index if not exists product_variants_product_idx
  on public.product_variants (product_id, sort_order);

-- -------------------------------------------------------------
-- 8. Halaman depan (editor blok di Admin → Halaman Depan)
--    Dua tabel sengaja dipisah: RLS bekerja per baris, bukan per
--    kolom, jadi draft tidak boleh ditaruh di tabel yang dibaca
--    publik.
--      site_pages        → yang TERBIT. Dibaca publik.
--      site_page_drafts  → draft yang sedang diedit. Hanya admin.
--    Selama belum ada baris terbit, halaman depan memakai susunan
--    bawaan dari kode.
-- -------------------------------------------------------------
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

-- -------------------------------------------------------------
-- 8b. Pengaturan SEO dan bisnis lokal (baris tunggal)
--     Diisi dari Admin → SEO & Toko. Semua kolom boleh kosong; selama
--     kosong, aplikasi memakai nilai bawaannya. Isinya memang tampil
--     publik di halaman (judul, data terstruktur, kode pelacakan),
--     sehingga boleh dibaca siapa saja.
--       · Identitas: alamat situs, kota, provinsi, tagline, deskripsi,
--         gambar sosial, logo. Kota dan nama toko dipakai mengganti
--         penanda {kota} dan {toko} di seluruh teks halaman.
--       · Bisnis lokal: telepon, alamat, koordinat, jam buka — untuk
--         data terstruktur Google (LocalBusiness).
--       · Verifikasi dan pelacakan: Search Console, Bing, GA4, Meta Pixel.
--       · noindex_site: mematikan pengindeksan seluruh situs (untuk
--         situs yang belum siap tayang).
-- -------------------------------------------------------------
create table if not exists public.seo_settings (
  id                  uuid primary key default gen_random_uuid(),
  site_url            text,
  city                text,
  region              text,
  tagline             text,
  default_description text,
  default_og_image    text,
  logo_url            text,
  phone               text,
  street_address      text,
  postal_code         text,
  latitude            double precision,
  longitude           double precision,
  open_days           text[] not null default '{}',
  opens               text,
  closes              text,
  price_range         text,
  same_as             text[] not null default '{}',
  google_verification text,
  bing_verification   text,
  ga4_id              text,
  meta_pixel_id       text,
  noindex_site        boolean not null default false,
  updated_at          timestamptz not null default now(),

  -- Hanya asal (origin) situs, tanpa path: https://toko.com
  constraint seo_settings_site_url_check
    check (site_url is null or site_url ~ '^https?://[^\s/]+$'),
  constraint seo_settings_latitude_check
    check (latitude is null or latitude between -90 and 90),
  constraint seo_settings_longitude_check
    check (longitude is null or longitude between -180 and 180),
  -- Koordinat harus berpasangan
  constraint seo_settings_geo_pair_check
    check ((latitude is null) = (longitude is null)),
  constraint seo_settings_price_range_check
    check (price_range is null or price_range in ('$', '$$', '$$$')),
  constraint seo_settings_open_days_check
    check (open_days <@ array['Mo','Tu','We','Th','Fr','Sa','Su']::text[])
);

-- Tabel ini tidak pernah punya lebih dari satu baris
create unique index if not exists seo_settings_singleton_idx
  on public.seo_settings ((true));

-- -------------------------------------------------------------
-- 8c. SEO halaman statis (beranda, semua produk, tentang, cara pesan)
--     Satu baris per halaman, dibuat dari Admin → SEO & Toko → Halaman.
--     Tanpa baris = judul dan deskripsi bawaan aplikasi. Isinya tampil
--     publik di <head> halaman, jadi boleh dibaca siapa saja.
-- -------------------------------------------------------------
create table if not exists public.seo_pages (
  slug            text primary key
    check (slug in ('beranda', 'produk', 'tentang', 'cara-pesan')),
  seo_title       text check (seo_title is null or char_length(seo_title) <= 70),
  seo_description text check (seo_description is null or char_length(seo_description) <= 200),
  og_image        text,
  noindex         boolean not null default false,
  updated_at      timestamptz not null default now()
);

-- -------------------------------------------------------------
-- 8d. Pengalihan alamat (redirect permanen)
--     Alamat lama → alamat baru. Dipakai saat slug produk/kategori
--     diganti (dibuat otomatis oleh aplikasi) atau diisi manual dari
--     Admin → SEO & Toko → Redirect. Hanya dibaca saat sebuah alamat
--     tidak ditemukan. Isinya hanya pemetaan alamat, jadi boleh dibaca
--     siapa saja.
-- -------------------------------------------------------------
create table if not exists public.seo_redirects (
  id         uuid primary key default gen_random_uuid(),
  from_path  text not null unique,
  to_path    text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Alamat situs sendiri: diawali satu "/", tanpa query/fragmen/spasi
  constraint seo_redirects_from_check
    check (from_path ~ '^/[^/?#[:space:]][^?#[:space:]]{0,198}$'),
  constraint seo_redirects_to_check
    check (
      to_path ~ '^/([^/[:space:]#][^[:space:]#]*)?$'
      and char_length(to_path) <= 300
    ),
  constraint seo_redirects_not_self check (from_path <> to_path)
);

-- -------------------------------------------------------------
-- 9. Trigger updated_at
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

drop trigger if exists site_pages_touch on public.site_pages;
create trigger site_pages_touch before update on public.site_pages
  for each row execute function public.touch_updated_at();

drop trigger if exists site_page_drafts_touch on public.site_page_drafts;
create trigger site_page_drafts_touch before update on public.site_page_drafts
  for each row execute function public.touch_updated_at();

drop trigger if exists seo_redirects_touch on public.seo_redirects;
create trigger seo_redirects_touch before update on public.seo_redirects
  for each row execute function public.touch_updated_at();

drop trigger if exists seo_pages_touch on public.seo_pages;
create trigger seo_pages_touch before update on public.seo_pages
  for each row execute function public.touch_updated_at();

drop trigger if exists seo_settings_touch on public.seo_settings;
create trigger seo_settings_touch before update on public.seo_settings
  for each row execute function public.touch_updated_at();

-- -------------------------------------------------------------
-- 10. Row Level Security
--     Aturan dasar:
--       · Publik → hanya MEMBACA baris yang aktif/terbit
--       · Admin  → baca dan tulis semuanya
--     "Admin" ditentukan oleh public.is_admin().
-- -------------------------------------------------------------
alter table public.schema_versions         enable row level security;
alter table public.admins                  enable row level security;
alter table public.categories              enable row level security;
alter table public.products                enable row level security;
alter table public.product_attributes      enable row level security;
alter table public.product_attribute_links enable row level security;
alter table public.store_settings          enable row level security;
alter table public.product_variants        enable row level security;
alter table public.site_pages              enable row level security;
alter table public.site_page_drafts        enable row level security;
alter table public.seo_settings            enable row level security;
alter table public.seo_pages               enable row level security;
alter table public.seo_redirects           enable row level security;

-- schema_versions — hanya admin yang perlu tahu isinya
drop policy if exists "versions admin read" on public.schema_versions;
create policy "versions admin read" on public.schema_versions
  for select using (public.is_admin());

-- admins — tiap admin hanya melihat barisnya sendiri. Tidak ada
-- policy INSERT/UPDATE: admin baru ditambah manual lewat SQL Editor.
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

-- store_settings — nomor WhatsApp dan alamat memang tampil di
-- footer situs, jadi boleh dibaca siapa saja.
drop policy if exists "settings public read" on public.store_settings;
create policy "settings public read" on public.store_settings
  for select using (true);

drop policy if exists "settings admin write" on public.store_settings;
create policy "settings admin write" on public.store_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- product_variants — mengikuti produk induknya. Subquery ke products
-- ikut terkena RLS-nya (is_active atau admin), jadi varian dari
-- produk yang disembunyikan tidak ikut bocor ke publik.
drop policy if exists "variants public read" on public.product_variants;
create policy "variants public read" on public.product_variants
  for select using (
    exists (
      select 1 from public.products p where p.id = product_variants.product_id
    )
  );

drop policy if exists "variants admin write" on public.product_variants;
create policy "variants admin write" on public.product_variants
  for all using (public.is_admin()) with check (public.is_admin());

-- site_pages — yang terbit: publik membaca, admin menulis
drop policy if exists "pages public read" on public.site_pages;
create policy "pages public read" on public.site_pages
  for select using (true);

drop policy if exists "pages admin write" on public.site_pages;
create policy "pages admin write" on public.site_pages
  for all using (public.is_admin()) with check (public.is_admin());

-- seo_settings — isinya tampil publik di halaman, jadi boleh dibaca siapa
-- saja; hanya admin yang menulis.
drop policy if exists "seo public read" on public.seo_settings;
create policy "seo public read" on public.seo_settings
  for select using (true);

drop policy if exists "seo admin write" on public.seo_settings;
create policy "seo admin write" on public.seo_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- seo_pages — sama seperti seo_settings: baca publik, tulis admin.
drop policy if exists "seo pages public read" on public.seo_pages;
create policy "seo pages public read" on public.seo_pages
  for select using (true);

drop policy if exists "seo pages admin write" on public.seo_pages;
create policy "seo pages admin write" on public.seo_pages
  for all using (public.is_admin()) with check (public.is_admin());

-- seo_redirects — baca publik (dipakai halaman yang tidak ditemukan), tulis admin.
drop policy if exists "seo redirects public read" on public.seo_redirects;
create policy "seo redirects public read" on public.seo_redirects
  for select using (true);

drop policy if exists "seo redirects admin write" on public.seo_redirects;
create policy "seo redirects admin write" on public.seo_redirects
  for all using (public.is_admin()) with check (public.is_admin());

-- site_page_drafts — hanya admin, baca maupun tulis
drop policy if exists "drafts admin all" on public.site_page_drafts;
create policy "drafts admin all" on public.site_page_drafts
  for all using (public.is_admin()) with check (public.is_admin());

-- -------------------------------------------------------------
-- 11. Penyimpanan foto produk
--     Bucket publik agar URL-nya langsung bisa dipakai <Image>
--     tanpa signed URL. Unggah dari halaman admin.
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
-- 12. Pencatatan versi
--     v1–v5 adalah riwayat file lama yang kini digabung di sini.
--     Saat menambah perubahan baru ke file ini, tambahkan satu
--     baris di sini dengan nomor berikutnya (v7, v8, ...).
-- -------------------------------------------------------------
insert into public.schema_versions (version, note)
values
  ('v1', 'Skema awal: admins, categories, products, store_settings'),
  ('v2', 'Atribut produk terstruktur (bentuk/material/warna) + lebar lensa untuk filter'),
  ('v3', 'Bundel konsolidasi v1+v2'),
  ('v4', 'Varian produk (harga & stok per pilihan), mis. ukuran lensa'),
  ('v5', 'Editor blok halaman depan: site_pages (terbit) + site_page_drafts (draft)'),
  ('v6', 'Semua digabung menjadi satu file setup.sql yang aman dijalankan berulang'),
  ('v7', 'Pengaturan SEO dan bisnis lokal (seo_settings): kota, alamat situs, data terstruktur, verifikasi, pelacakan'),
  ('v8', 'SEO per produk, kategori, dan halaman statis (seo_title, seo_description, seo_pages)'),
  ('v9', 'Pengalihan alamat (seo_redirects) dan teks alternatif foto produk (image_alts)'),
  ('v10', 'Tema warna toko (store_settings.theme dan theme_colors)'),
  ('v11', 'Tata letak halaman depan (store_settings.layout)')
on conflict (version) do nothing;

-- -------------------------------------------------------------
-- 13. Daftarkan admin (KHUSUS toko baru — lakukan SEKALI)
--     Buat dulu user di Authentication → Users, lalu ganti email
--     di bawah dengan email user itu, hapus tanda "--" di awal
--     tiga baris, dan jalankan. Aman diulang (on conflict).
-- -------------------------------------------------------------
-- insert into public.admins (user_id, email)
-- select id, email from auth.users where email = 'email-anda@contoh.com'
-- on conflict (user_id) do nothing;

-- -------------------------------------------------------------
-- Ringkasan — hasil yang muncul setelah file ini dijalankan
-- -------------------------------------------------------------
-- Dua penanda versi, supaya jelas apa yang sebenarnya terpasang:
--   versi_file      versi file INI (tertulis di bawah). Bila yang tampil lebih
--                   kecil dari yang diharapkan, yang dijalankan adalah salinan
--                   lama file ini — ambil ulang dari GitHub lalu jalankan lagi.
--   versi_database  versi tertinggi yang tercatat di tabel schema_versions.
-- Saat menambah perubahan baru: naikkan versi_file DAN tambah barisnya di
-- bagian 12.
select
  'v11'                                           as versi_file,
  (select 'v' || max(substring(version from 2)::int)
     from public.schema_versions
    where version ~ '^v[0-9]+$')                  as versi_database,
  (select count(*) from information_schema.tables
    where table_schema = 'public'
      and table_name in (
        'schema_versions', 'admins', 'categories', 'products',
        'product_attributes', 'product_attribute_links', 'store_settings',
        'product_variants', 'site_pages', 'site_page_drafts', 'seo_settings', 'seo_pages', 'seo_redirects'
      ))                                          as tabel_terpasang_dari_13,
  (select count(*) from public.admins)            as jumlah_admin,
  (select string_agg(
            version, ', '
            order by case when version ~ '^v[0-9]+$'
                          then substring(version from 2)::int end)
     from public.schema_versions)                 as versi_tercatat,
  case
    when (select count(*) from public.admins) = 0
      then 'LANGKAH BERIKUTNYA: daftarkan akun admin (bagian 13 di file ini)'
    else 'Siap dipakai'
  end                                             as status;
