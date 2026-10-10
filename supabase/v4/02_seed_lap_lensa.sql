-- =============================================================
--  v4 · 02 · DATA CONTOH: LAP KACAMATA + VARIAN LENSA (opsional)
--
--  1. Kategori "Lap Kacamata" dan dua produknya.
--  2. Varian ukuran untuk tiga lensa contoh dari v3/02_seed.sql,
--     sehingga fitur varian langsung bisa dicoba.
--
--  Jalankan setelah 01_variants.sql. Aman dijalankan ulang: kategori
--  dan produk yang slug-nya sudah ada TIDAK ditimpa (jadi hasil edit
--  Anda di CMS tetap aman), dan varian memakai unique(product_id, label).
--
--  Lewati file ini kalau Anda mau mengisi semuanya sendiri lewat /admin.
-- =============================================================

-- ---------- Kategori ----------
insert into public.categories (slug, name, description, image_url, sort_order)
values
  ('lap-kacamata', 'Lap Kacamata',
   'Microfiber serat halus untuk membersihkan lensa tanpa menggores.',
   '/products/cloth-jade.svg', 7)
on conflict (slug) do nothing;

-- ---------- Produk lap ----------
insert into public.products
  (slug, name, brand, description, price, compare_at_price, stock,
   images, category_id, is_featured, specs)
select s.slug, s.name, s.brand, s.description, s.price, s.compare_at_price, s.stock,
       s.images, c.id, false, s.specs
from (
  values
    ('lap-microfiber-serat-halus', 'Lap Microfiber Serat Halus', 'Lensara Studio',
     'Serat super halus yang mengangkat debu, sidik jari, dan minyak tanpa meninggalkan goresan. Cuci dan pakai berulang kali.',
     15000, null::integer, 200, array['/products/cloth-jade.svg','/products/cloth-sand.svg'],
     '{"Bahan":"Microfiber","Ukuran":"15 x 15 cm","Bisa dicuci":"Ya"}'::jsonb),
    ('lap-microfiber-set-3', 'Lap Microfiber Set Isi 3', 'Lensara Studio',
     'Tiga lembar sekaligus: satu untuk tas, satu untuk meja kerja, satu cadangan di kotak kacamata.',
     35000, 45000, 120, array['/products/cloth-sand.svg','/products/cloth-jade.svg'],
     '{"Bahan":"Microfiber","Isi":"3 lembar","Ukuran":"15 x 15 cm"}'::jsonb)
) as s(slug, name, brand, description, price, compare_at_price, stock, images, specs)
join public.categories c on c.slug = 'lap-kacamata'
on conflict (slug) do nothing;

-- ---------- Varian lensa ----------
with seed(product_slug, label, price, compare_at_price, stock, sort_order) as (
  values
    ('lensa-blue-light-single-vision', 'Netral (tanpa minus)',  250000, null::integer, 40, 1),
    ('lensa-blue-light-single-vision', 'Minus 0,25 – 4,00',     385000, 450000,        60, 2),
    ('lensa-blue-light-single-vision', 'Minus 4,25 – 6,00',     485000, null,          40, 3),
    ('lensa-blue-light-single-vision', 'Minus 6,25 – 8,00',     625000, null,          20, 4),
    ('lensa-blue-light-single-vision', 'Plus 0,25 – 4,00',      450000, null,          30, 5),

    ('lensa-progresif-premium', 'Indeks 1.56', 1250000, null::integer, 25, 1),
    ('lensa-progresif-premium', 'Indeks 1.60', 1850000, 2250000,       25, 2),
    ('lensa-progresif-premium', 'Indeks 1.67', 2400000, null,          10, 3),

    ('lensa-photochromic-transitions', 'Netral (tanpa minus)', 650000,  null::integer, 25, 1),
    ('lensa-photochromic-transitions', 'Minus 0,25 – 4,00',    975000,  null,          30, 2),
    ('lensa-photochromic-transitions', 'Minus 4,25 – 6,00',    1250000, null,          15, 3)
)
insert into public.product_variants
  (product_id, label, price, compare_at_price, stock, sort_order)
select p.id, s.label, s.price, s.compare_at_price, s.stock, s.sort_order
from seed s
join public.products p on p.slug = s.product_slug
on conflict (product_id, label) do nothing;

-- ---------- Samakan ringkasan di tabel products ----------
-- Harga = termurah, stok = total, harga coret dikosongkan (tiap varian
-- punya sendiri). Hanya untuk produk yang memang punya varian.
update public.products p
set price            = v.min_price,
    stock            = v.total_stock,
    compare_at_price = null
from (
  select product_id, min(price) as min_price, sum(stock)::integer as total_stock
  from public.product_variants
  group by product_id
) v
where p.id = v.product_id;
