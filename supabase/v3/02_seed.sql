-- =============================================================
--  v3 · 02 · DATA CONTOH (opsional)
--
--  Menggabungkan seed kategori & produk (dari v1/04_seed.sql) dan
--  seed atribut filter (dari v2/02_seed_attributes.sql) jadi satu
--  file. Isinya sama persis dengan src/lib/data/sample-data.ts,
--  jadi tampilan situs tidak berubah saat Supabase mulai dipakai.
--
--  Jalankan setelah 01_schema.sql.
--
--  Lewati file ini kalau Anda mau langsung mengisi produk sendiri
--  lewat halaman /admin — filternya tetap berfungsi, hanya kosong
--  sampai Anda menambahkan produk dan atributnya sendiri.
--
--  Aman dijalankan ulang — semua pakai upsert berdasarkan slug,
--  jadi tidak akan membuat duplikat.
-- =============================================================

-- =============================================================
--  BAGIAN A — Kategori
-- =============================================================

insert into public.categories (slug, name, description, image_url, sort_order)
values
  ('kacamata-pria',    'Kacamata Pria',    'Frame tegas dan ringan untuk keseharian maupun kerja.',      '/products/square-ink.svg',    1),
  ('kacamata-wanita',  'Kacamata Wanita',  'Siluet lembut, cat-eye, dan pilihan warna hangat.',           '/products/cateye-rose.svg',   2),
  ('kacamata-anak',    'Kacamata Anak',    'Bahan lentur anti patah, nyaman dipakai seharian.',           '/products/round-sand.svg',    3),
  ('sunglasses',       'Sunglasses',       'Proteksi UV400 dengan gaya yang tidak berlebihan.',           '/products/aviator-ink.svg',   4),
  ('kacamata-premium', 'Kacamata Premium', 'Titanium dan asetat Jepang untuk pemakaian jangka panjang.',  '/products/browline-jade.svg', 5),
  ('lensa',            'Lensa Kacamata',   'Single vision, progresif, blue light, hingga photochromic.',  '/products/lens-jade.svg',     6)
on conflict (slug) do update set
  name        = excluded.name,
  description = excluded.description,
  image_url   = excluded.image_url,
  sort_order  = excluded.sort_order;

-- =============================================================
--  BAGIAN B — Produk
--  lens_width_mm disertakan langsung di sini — di v1+v2 lama
--  nilai ini diisi belakangan lewat UPDATE terpisah.
-- =============================================================

with seed(slug, name, brand, description, price, compare_at_price, stock,
          images, category_slug, is_featured, lens_width_mm, specs, created_at) as (
  values
    ('arka-square-matte-black', 'Arka Square Matte Black', 'Lensara Studio',
     'Frame persegi dengan sudut membulat, dibuat dari asetat matte yang tidak licin saat berkeringat. Pilihan aman untuk wajah oval dan bulat karena garis horizontalnya menyeimbangkan proporsi.',
     385000, 520000, 24, array['/products/square-ink.svg','/products/rectangle-slate.svg'], 'kacamata-pria', true, 52,
     '{"Material":"Asetat premium","Bentuk":"Persegi","Lebar Lensa":"52 mm","Lebar Bridge":"18 mm","Panjang Gagang":"145 mm","Berat":"24 gram"}'::jsonb,
     '2026-07-28T04:00:00Z'::timestamptz),

    ('nadira-cateye-rose', 'Nadira Cat-Eye Rose', 'Lensara Studio',
     'Cat-eye dengan sudut naik yang halus, tidak terlalu dramatis sehingga tetap pantas dipakai ke kantor. Warna rose muted memberi kesan hangat tanpa mencolok.',
     429000, null, 18, array['/products/cateye-rose.svg','/products/cateye-sand.svg'], 'kacamata-wanita', true, 50,
     '{"Material":"Asetat Italia","Bentuk":"Cat-eye","Lebar Lensa":"50 mm","Lebar Bridge":"19 mm","Panjang Gagang":"142 mm","Berat":"21 gram"}'::jsonb,
     '2026-07-30T04:00:00Z'::timestamptz),

    ('kavi-round-titanium', 'Kavi Round Titanium', 'Kavi',
     'Frame bundar dari titanium murni, hanya 12 gram. Hampir tidak terasa dipakai seharian dan tidak meninggalkan bekas di hidung.',
     1250000, 1490000, 7, array['/products/round-ink.svg','/products/round-sand.svg'], 'kacamata-premium', true, 47,
     '{"Material":"Titanium beta","Bentuk":"Bundar","Lebar Lensa":"47 mm","Lebar Bridge":"21 mm","Panjang Gagang":"145 mm","Berat":"12 gram"}'::jsonb,
     '2026-08-01T04:00:00Z'::timestamptz),

    ('solano-aviator-gold', 'Solano Aviator Gold', 'Solano',
     'Aviator klasik dengan lensa polarized UV400. Mengurangi silau dari aspal dan permukaan air, cocok untuk berkendara siang hari.',
     675000, 850000, 15, array['/products/aviator-amber.svg','/products/aviator-ink.svg'], 'sunglasses', true, 58,
     '{"Material":"Stainless steel","Bentuk":"Aviator","Lensa":"Polarized UV400","Lebar Lensa":"58 mm","Panjang Gagang":"140 mm","Berat":"27 gram"}'::jsonb,
     '2026-07-22T04:00:00Z'::timestamptz),

    ('brio-browline-jade', 'Brio Browline Jade', 'Lensara Studio',
     'Browline dengan alis tebal di bagian atas dan rim bawah tipis. Memberi struktur pada wajah tanpa membuat frame terasa berat.',
     465000, null, 11, array['/products/browline-jade.svg','/products/browline-slate.svg'], 'kacamata-pria', true, 51,
     '{"Material":"Asetat + metal","Bentuk":"Browline","Lebar Lensa":"51 mm","Lebar Bridge":"20 mm","Panjang Gagang":"145 mm","Berat":"26 gram"}'::jsonb,
     '2026-07-19T04:00:00Z'::timestamptz),

    ('mira-rectangle-slate', 'Mira Rectangle Slate', 'Lensara Studio',
     'Persegi panjang tipis dengan warna abu kebiruan. Netral, mudah dipadukan, dan tidak mendominasi wajah.',
     299000, 375000, 32, array['/products/rectangle-slate.svg','/products/rectangle-jade.svg'], 'kacamata-wanita', false, 53,
     '{"Material":"TR90","Bentuk":"Persegi panjang","Lebar Lensa":"53 mm","Lebar Bridge":"17 mm","Panjang Gagang":"140 mm","Berat":"18 gram"}'::jsonb,
     '2026-08-04T04:00:00Z'::timestamptz),

    ('pixel-kids-flex-round', 'Pixel Kids Flex Round', 'Pixel',
     'Dibuat dari TR90 yang bisa dipuntir tanpa patah. Gagangnya memakai engsel per sehingga tetap presisi meski sering dilepas-pasang anak.',
     235000, 289000, 20, array['/products/round-sand.svg','/products/round-ink.svg'], 'kacamata-anak', false, 44,
     '{"Material":"TR90 fleksibel","Bentuk":"Bundar","Usia":"6 - 12 tahun","Lebar Lensa":"44 mm","Panjang Gagang":"125 mm","Berat":"14 gram"}'::jsonb,
     '2026-08-05T04:00:00Z'::timestamptz),

    ('vesta-square-amber', 'Vesta Square Amber', 'Vesta',
     'Asetat amber transparan yang memperlihatkan gradasi warna saat terkena cahaya. Bentuk persegi tebal untuk tampilan yang lebih berkarakter.',
     512000, null, 9, array['/products/square-amber.svg','/products/square-ink.svg'], 'kacamata-wanita', false, 54,
     '{"Material":"Asetat transparan","Bentuk":"Persegi","Lebar Lensa":"54 mm","Lebar Bridge":"18 mm","Panjang Gagang":"145 mm","Berat":"29 gram"}'::jsonb,
     '2026-08-06T04:00:00Z'::timestamptz),

    ('noir-cateye-sunglasses', 'Noir Cat-Eye Sunglasses', 'Noir',
     'Sunglasses cat-eye dengan lensa gradasi cokelat. Bagian atas lebih gelap untuk menahan matahari dari atas, bagian bawah lebih terang agar pandangan tetap jelas.',
     549000, 699000, 13, array['/products/cateye-sand.svg','/products/cateye-rose.svg'], 'sunglasses', false, 56,
     '{"Material":"Asetat","Bentuk":"Cat-eye","Lensa":"Gradient UV400","Lebar Lensa":"56 mm","Panjang Gagang":"142 mm","Berat":"25 gram"}'::jsonb,
     '2026-07-25T04:00:00Z'::timestamptz),

    ('atlas-titanium-browline', 'Atlas Titanium Browline', 'Atlas',
     'Browline titanium dengan finishing sikat halus. Engsel tanpa sekrup sehingga tidak perlu dikencangkan berkala.',
     1680000, null, 4, array['/products/browline-slate.svg','/products/browline-jade.svg'], 'kacamata-premium', false, 52,
     '{"Material":"Titanium","Bentuk":"Browline","Lebar Lensa":"52 mm","Lebar Bridge":"19 mm","Panjang Gagang":"147 mm","Berat":"15 gram"}'::jsonb,
     '2026-07-15T04:00:00Z'::timestamptz),

    ('lensa-blue-light-single-vision', 'Lensa Blue Light Single Vision', 'Essilor',
     'Lensa minus atau plus dengan lapisan penahan cahaya biru dari layar. Direkomendasikan untuk yang bekerja di depan komputer lebih dari 6 jam sehari.',
     385000, 450000, 60, array['/products/lens-jade.svg','/products/lens-slate.svg'], 'lensa', true, null,
     '{"Tipe":"Single vision","Indeks":"1.56","Lapisan":"Blue light + anti gores","Rentang Power":"-6.00 s/d +4.00","Garansi":"1 tahun"}'::jsonb,
     '2026-08-02T04:00:00Z'::timestamptz),

    ('lensa-progresif-premium', 'Lensa Progresif Premium', 'Essilor',
     'Tiga jarak pandang dalam satu lensa tanpa garis pemisah: jauh, menengah, dan baca. Perlu masa adaptasi sekitar satu minggu.',
     1850000, 2250000, 25, array['/products/lens-slate.svg','/products/lens-jade.svg'], 'lensa', false, null,
     '{"Tipe":"Progresif","Indeks":"1.60","Lapisan":"Anti radiasi + anti gores","Rentang Power":"-8.00 s/d +5.00","Garansi":"1 tahun"}'::jsonb,
     '2026-07-11T04:00:00Z'::timestamptz),

    ('lensa-photochromic-transitions', 'Lensa Photochromic Transitions', 'Transitions',
     'Otomatis menggelap saat kena sinar matahari dan bening kembali di dalam ruangan. Satu kacamata untuk dua kebutuhan.',
     975000, null, 30, array['/products/lens-jade.svg','/products/lens-slate.svg'], 'lensa', false, null,
     '{"Tipe":"Photochromic","Indeks":"1.56","Lapisan":"UV400 + anti gores","Waktu Transisi":"± 30 detik","Garansi":"1 tahun"}'::jsonb,
     '2026-07-08T04:00:00Z'::timestamptz),

    ('orion-rectangle-jade', 'Orion Rectangle Jade', 'Lensara Studio',
     'Hijau jade gelap yang terlihat hitam dari kejauhan, tapi menampakkan warnanya saat kena cahaya. Untuk yang ingin tampil netral dengan sedikit kejutan.',
     349000, null, 27, array['/products/rectangle-jade.svg','/products/rectangle-slate.svg'], 'kacamata-pria', false, 54,
     '{"Material":"Asetat","Bentuk":"Persegi panjang","Lebar Lensa":"54 mm","Lebar Bridge":"18 mm","Panjang Gagang":"145 mm","Berat":"23 gram"}'::jsonb,
     '2026-08-07T02:00:00Z'::timestamptz),

    ('juno-kids-square', 'Juno Kids Square', 'Pixel',
     'Frame persegi ukuran anak dengan nose pad silikon yang tidak melorot saat berlari. Tersedia tali pengaman di dalam paket.',
     259000, null, 16, array['/products/square-amber.svg','/products/round-sand.svg'], 'kacamata-anak', false, 46,
     '{"Material":"TR90 fleksibel","Bentuk":"Persegi","Usia":"8 - 14 tahun","Lebar Lensa":"46 mm","Panjang Gagang":"130 mm","Berat":"15 gram"}'::jsonb,
     '2026-08-03T04:00:00Z'::timestamptz),

    ('dune-aviator-ink', 'Dune Aviator Ink', 'Solano',
     'Aviator dengan finishing hitam doff dan lensa abu pekat. Pilihan yang lebih kalem dibanding versi gold.',
     589000, 720000, 10, array['/products/aviator-ink.svg','/products/aviator-amber.svg'], 'sunglasses', false, 59,
     '{"Material":"Stainless steel","Bentuk":"Aviator","Lensa":"Polarized UV400","Lebar Lensa":"59 mm","Panjang Gagang":"141 mm","Berat":"28 gram"}'::jsonb,
     '2026-08-06T09:00:00Z'::timestamptz),

    ('sena-round-sand', 'Sena Round Sand', 'Lensara Studio',
     'Bundar tipis warna pasir dengan gagang metal. Ringan, hangat, dan cocok untuk wajah dengan garis rahang tegas.',
     325000, 399000, 21, array['/products/round-sand.svg','/products/round-ink.svg'], 'kacamata-wanita', false, 48,
     '{"Material":"Asetat + metal","Bentuk":"Bundar","Lebar Lensa":"48 mm","Lebar Bridge":"20 mm","Panjang Gagang":"143 mm","Berat":"19 gram"}'::jsonb,
     '2026-08-07T01:00:00Z'::timestamptz),

    ('helio-premium-acetate', 'Helio Premium Acetate', 'Vesta',
     'Asetat Jepang yang dipoles tangan selama tiga minggu. Permukaannya tetap mengkilap setelah pemakaian bertahun-tahun.',
     1425000, 1690000, 5, array['/products/square-ink.svg','/products/square-amber.svg'], 'kacamata-premium', false, 53,
     '{"Material":"Asetat Jepang","Bentuk":"Persegi","Lebar Lensa":"53 mm","Lebar Bridge":"19 mm","Panjang Gagang":"146 mm","Berat":"28 gram"}'::jsonb,
     '2026-07-05T04:00:00Z'::timestamptz)
)
insert into public.products
  (slug, name, brand, description, price, compare_at_price, stock,
   images, category_id, is_featured, lens_width_mm, specs, created_at)
select s.slug, s.name, s.brand, s.description, s.price, s.compare_at_price, s.stock,
       s.images, c.id, s.is_featured, s.lens_width_mm, s.specs, s.created_at
from seed s
join public.categories c on c.slug = s.category_slug
on conflict (slug) do update set
  name             = excluded.name,
  brand            = excluded.brand,
  description      = excluded.description,
  price            = excluded.price,
  compare_at_price = excluded.compare_at_price,
  stock            = excluded.stock,
  images           = excluded.images,
  category_id      = excluded.category_id,
  is_featured      = excluded.is_featured,
  lens_width_mm    = excluded.lens_width_mm,
  specs            = excluded.specs;

-- =============================================================
--  BAGIAN C — Daftar pilihan atribut
-- =============================================================

insert into public.product_attributes (type, slug, name, swatch_hex, sort_order)
values
  -- Bentuk frame. Urutan mengikuti seberapa umum dipakai.
  ('bentuk', 'bundar',          'Bundar',          null, 1),
  ('bentuk', 'kotak',           'Kotak',           null, 2),
  ('bentuk', 'persegi-panjang', 'Persegi Panjang', null, 3),
  ('bentuk', 'cat-eye',         'Cat-Eye',         null, 4),
  ('bentuk', 'aviator',         'Aviator',         null, 5),
  ('bentuk', 'browline',        'Browline',        null, 6),

  -- Material frame
  ('material', 'asetat',          'Asetat',          null, 1),
  ('material', 'titanium',        'Titanium',        null, 2),
  ('material', 'metal',           'Metal',           null, 3),
  ('material', 'stainless-steel', 'Stainless Steel', null, 4),
  ('material', 'tr90',            'TR90',            null, 5),

  -- Warna frame. swatch_hex dipakai untuk bulatan warna di filter.
  ('warna', 'hitam',   'Hitam',   '#1F2421', 1),
  ('warna', 'cokelat', 'Cokelat', '#6B4F3A', 2),
  ('warna', 'abu',     'Abu-abu', '#6E7780', 3),
  ('warna', 'hijau',   'Hijau',   '#2F5D4A', 4),
  ('warna', 'rose',    'Rose',    '#C89A94', 5),
  ('warna', 'amber',   'Amber',   '#C99B4F', 6),
  ('warna', 'bening',  'Bening',  '#DCE3E0', 7),
  ('warna', 'gold',    'Gold',    '#C9A24B', 8),
  ('warna', 'silver',  'Silver',  '#B9BEC2', 9)
on conflict (type, slug) do update set
  name       = excluded.name,
  swatch_hex = excluded.swatch_hex,
  sort_order = excluded.sort_order;

-- =============================================================
--  BAGIAN D — Pasang atribut ke produk contoh
-- =============================================================

with mapping(product_slug, attr_type, attr_slug) as (
  values
    ('arka-square-matte-black', 'bentuk',   'kotak'),
    ('arka-square-matte-black', 'material', 'asetat'),
    ('arka-square-matte-black', 'warna',    'hitam'),

    ('nadira-cateye-rose',      'bentuk',   'cat-eye'),
    ('nadira-cateye-rose',      'material', 'asetat'),
    ('nadira-cateye-rose',      'warna',    'rose'),

    ('kavi-round-titanium',     'bentuk',   'bundar'),
    ('kavi-round-titanium',     'material', 'titanium'),
    ('kavi-round-titanium',     'warna',    'hitam'),

    ('solano-aviator-gold',     'bentuk',   'aviator'),
    ('solano-aviator-gold',     'material', 'stainless-steel'),
    ('solano-aviator-gold',     'warna',    'gold'),

    ('brio-browline-jade',      'bentuk',   'browline'),
    ('brio-browline-jade',      'material', 'asetat'),
    ('brio-browline-jade',      'material', 'metal'),
    ('brio-browline-jade',      'warna',    'hijau'),

    ('mira-rectangle-slate',    'bentuk',   'persegi-panjang'),
    ('mira-rectangle-slate',    'material', 'tr90'),
    ('mira-rectangle-slate',    'warna',    'abu'),

    ('pixel-kids-flex-round',   'bentuk',   'bundar'),
    ('pixel-kids-flex-round',   'material', 'tr90'),
    ('pixel-kids-flex-round',   'warna',    'cokelat'),

    ('vesta-square-amber',      'bentuk',   'kotak'),
    ('vesta-square-amber',      'material', 'asetat'),
    ('vesta-square-amber',      'warna',    'amber'),

    ('noir-cateye-sunglasses',  'bentuk',   'cat-eye'),
    ('noir-cateye-sunglasses',  'material', 'asetat'),
    ('noir-cateye-sunglasses',  'warna',    'cokelat'),

    ('atlas-titanium-browline', 'bentuk',   'browline'),
    ('atlas-titanium-browline', 'material', 'titanium'),
    ('atlas-titanium-browline', 'warna',    'abu'),

    ('orion-rectangle-jade',    'bentuk',   'persegi-panjang'),
    ('orion-rectangle-jade',    'material', 'asetat'),
    ('orion-rectangle-jade',    'warna',    'hijau'),

    ('juno-kids-square',        'bentuk',   'kotak'),
    ('juno-kids-square',        'material', 'tr90'),
    ('juno-kids-square',        'warna',    'amber'),

    ('dune-aviator-ink',        'bentuk',   'aviator'),
    ('dune-aviator-ink',        'material', 'stainless-steel'),
    ('dune-aviator-ink',        'warna',    'hitam'),

    ('sena-round-sand',         'bentuk',   'bundar'),
    ('sena-round-sand',         'material', 'asetat'),
    ('sena-round-sand',         'material', 'metal'),
    ('sena-round-sand',         'warna',    'cokelat'),

    ('helio-premium-acetate',   'bentuk',   'kotak'),
    ('helio-premium-acetate',   'material', 'asetat'),
    ('helio-premium-acetate',   'warna',    'hitam')
)
insert into public.product_attribute_links (product_id, attribute_id)
select p.id, a.id
from mapping m
join public.products p
  on p.slug = m.product_slug
join public.product_attributes a
  on a.type = m.attr_type and a.slug = m.attr_slug
on conflict do nothing;

-- Ringkasan hasil
select
  (select count(*) from public.categories)              as total_kategori,
  (select count(*) from public.products)                as total_produk,
  (select count(*) from public.product_attributes)       as opsi_filter,
  (select count(*) from public.product_attribute_links)  as pemasangan_atribut;
