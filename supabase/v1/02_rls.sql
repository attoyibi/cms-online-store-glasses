-- =============================================================
--  v1 · 02 · ROW LEVEL SECURITY
--
--  Aturannya sederhana:
--    · Publik  → hanya boleh MEMBACA baris yang is_active = true
--    · Admin   → boleh baca & tulis semuanya
--
--  "Admin" ditentukan oleh fungsi public.is_admin() yang dibuat
--  di 01_schema.sql, yaitu user yang user_id-nya ada di tabel admins.
--
--  Jalankan setelah 01_schema.sql. Aman dijalankan ulang.
-- =============================================================

alter table public.admins         enable row level security;
alter table public.categories     enable row level security;
alter table public.products       enable row level security;
alter table public.store_settings enable row level security;
alter table public.schema_versions enable row level security;

-- -------------------------------------------------------------
-- admins — tiap admin hanya bisa melihat barisnya sendiri.
-- Tidak ada policy INSERT/UPDATE: penambahan admin dilakukan
-- manual lewat SQL Editor (lihat README).
-- -------------------------------------------------------------
drop policy if exists "admins read own row" on public.admins;
create policy "admins read own row" on public.admins
  for select using (user_id = auth.uid());

-- -------------------------------------------------------------
-- categories
-- -------------------------------------------------------------
drop policy if exists "categories public read" on public.categories;
create policy "categories public read" on public.categories
  for select using (is_active or public.is_admin());

drop policy if exists "categories admin write" on public.categories;
create policy "categories admin write" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- -------------------------------------------------------------
-- products
-- -------------------------------------------------------------
drop policy if exists "products public read" on public.products;
create policy "products public read" on public.products
  for select using (is_active or public.is_admin());

drop policy if exists "products admin write" on public.products;
create policy "products admin write" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- -------------------------------------------------------------
-- store_settings — nomor WhatsApp & alamat memang tampil di
-- footer situs, jadi boleh dibaca siapa saja.
-- -------------------------------------------------------------
drop policy if exists "settings public read" on public.store_settings;
create policy "settings public read" on public.store_settings
  for select using (true);

drop policy if exists "settings admin write" on public.store_settings;
create policy "settings admin write" on public.store_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- -------------------------------------------------------------
-- schema_versions — hanya admin yang perlu tahu isinya
-- -------------------------------------------------------------
drop policy if exists "versions admin read" on public.schema_versions;
create policy "versions admin read" on public.schema_versions
  for select using (public.is_admin());
