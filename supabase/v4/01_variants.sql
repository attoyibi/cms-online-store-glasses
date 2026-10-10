-- =============================================================
--  v4 · 01 · VARIAN PRODUK
--
--  Menambah tabel product_variants: satu produk bisa punya beberapa
--  pilihan dengan harga & stok masing-masing. Dibutuhkan terutama
--  untuk lensa, yang harganya bergantung pada ukuran minus/plus.
--
--  Jalankan SETELAH v3 (atau v1+v2). Aman dijalankan ulang.
--  Produk yang tidak punya varian tetap bekerja persis seperti
--  sebelumnya, memakai kolom harga & stoknya sendiri.
--
--  Catatan: untuk produk BERVARIAN, kolom products.price diisi harga
--  termurah dan products.stock jumlah stok semua varian. Halaman admin
--  mengisinya otomatis saat menyimpan; supaya pengurutan harga dan
--  filter harga di katalog tetap benar tanpa join.
-- =============================================================

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
  -- Mencegah dua varian berlabel sama pada satu produk; juga membuat
  -- seed bisa dijalankan ulang tanpa menggandakan baris.
  constraint product_variants_label_unique unique (product_id, label)
);

create index if not exists product_variants_product_idx
  on public.product_variants (product_id, sort_order);

-- -------------------------------------------------------------
-- RLS — mengikuti produk induknya
-- -------------------------------------------------------------
alter table public.product_variants enable row level security;

-- Subquery ke products ikut terkena RLS-nya (is_active atau admin),
-- jadi varian dari produk yang disembunyikan tidak ikut bocor ke publik.
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

-- -------------------------------------------------------------
insert into public.schema_versions (version, note)
values ('v4', 'Varian produk (harga & stok per pilihan), mis. ukuran lensa')
on conflict (version) do nothing;
