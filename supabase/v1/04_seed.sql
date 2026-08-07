-- =============================================================
--  v1 · 04 · DATA CONTOH (opsional)
--
--  Isinya sama persis dengan src/lib/data/sample-data.ts, jadi
--  tampilan situs tidak berubah saat Supabase mulai dipakai.
--
--  Lewati file ini kalau Anda mau langsung mengisi produk sendiri
--  lewat halaman /admin.
--
--  Aman dijalankan ulang — memakai upsert berdasarkan slug, jadi
--  tidak akan membuat duplikat.
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

with seed(slug, name, brand, description, price, compare_at_price, stock,
          images, category_slug, is_featured, specs, created_at) as (
  values
    ('arka-square-matte-black', 'Arka Square Matte Black', 'Lensara Studio',
     'Frame persegi dengan sudut membulat, dibuat dari asetat matte yang tidak licin saat berkeringat. Pilihan aman untuk wajah oval dan bulat karena garis horizontalnya menyeimbangkan proporsi.',
     385000, 520000, 24, array['/products/square-ink.svg','/products/rectangle-slate.svg'], 'kacamata-pria', true,
     '{"Material":"Asetat premium","Bentuk":"Persegi","Lebar Lensa":"52 mm","Lebar Bridge":"18 mm","Panjang Gagang":"145 mm","Berat":"24 gram"}'::jsonb,
     '2026-07-28T04:00:00Z'::timestamptz),

    ('nadira-cateye-rose', 'Nadira Cat-Eye Rose', 'Lensara Studio',
     'Cat-eye dengan sudut naik yang halus, tidak terlalu dramatis sehingga tetap pantas dipakai ke kantor. Warna rose muted memberi kesan hangat tanpa mencolok.',
     429000, null, 18, array['/products/cateye-rose.svg','/products/cateye-sand.svg'], 'kacamata-wanita', true,
     '{"Material":"Asetat Italia","Bentuk":"Cat-eye","Lebar Lensa":"50 mm","Lebar Bridge":"19 mm","Panjang Gagang":"142 mm","Berat":"21 gram"}'::jsonb,
     '2026-07-30T04:00:00Z'::timestamptz),

    ('kavi-round-titanium', 'Kavi Round Titanium', 'Kavi',
     'Frame bundar dari titanium murni, hanya 12 gram. Hampir tidak terasa dipakai seharian dan tidak meninggalkan bekas di hidung.',
     1250000, 1490000, 7, array['/products/round-ink.svg','/products/round-sand.svg'], 'kacamata-premium', true,
     '{"Material":"Titanium beta","Bentuk":"Bundar","Lebar Lensa":"47 mm","Lebar Bridge":"21 mm","Panjang Gagang":"145 mm","Berat":"12 gram"}'::jsonb,
     '2026-08-01T04:00:00Z'::timestamptz),

    ('solano-aviator-gold', 'Solano Aviator Gold', 'Solano',
     'Aviator klasik dengan lensa polarized UV400. Mengurangi silau dari aspal dan permukaan air, cocok untuk berkendara siang hari.',
     675000, 850000, 15, array['/products/aviator-amber.svg','/products/aviator-ink.svg'], 'sunglasses', true,
     '{"Material":"Stainless steel","Bentuk":"Aviator","Lensa":"Polarized UV400","Lebar Lensa":"58 mm","Panjang Gagang":"140 mm","Berat":"27 gram"}'::jsonb,
     '2026-07-22T04:00:00Z'::timestamptz),

    ('brio-browline-jade', 'Brio Browline Jade', 'Lensara Studio',
     'Browline dengan alis tebal di bagian atas dan rim bawah tipis. Memberi struktur pada wajah tanpa membuat frame terasa berat.',
     465000, null, 11, array['/products/browline-jade.svg','/products/browline-slate.svg'], 'kacamata-pria', true,
     '{"Material":"Asetat + metal","Bentuk":"Browline","Lebar Lensa":"51 mm","Lebar Bridge":"20 mm","Panjang Gagang":"145 mm","Berat":"26 gram"}'::jsonb,
     '2026-07-19T04:00:00Z'::timestamptz),

    ('mira-rectangle-slate', 'Mira Rectangle Slate', 'Lensara Studio',
     'Persegi panjang tipis dengan warna abu kebiruan. Netral, mudah dipadukan, dan tidak mendominasi wajah.',
     299000, 375000, 32, array['/products/rectangle-slate.svg','/products/rectangle-jade.svg'], 'kacamata-wanita', false,
     '{"Material":"TR90","Bentuk":"Persegi panjang","Lebar Lensa":"53 mm","Lebar Bridge":"17 mm","Panjang Gagang":"140 mm","Berat":"18 gram"}'::jsonb,
     '2026-08-04T04:00:00Z'::timestamptz),

    ('pixel-kids-flex-round', 'Pixel Kids Flex Round', 'Pixel',
     'Dibuat dari TR90 yang bisa dipuntir tanpa patah. Gagangnya memakai engsel per sehingga tetap presisi meski sering dilepas-pasang anak.',
     235000, 289000, 20, array['/products/round-sand.svg','/products/round-ink.svg'], 'kacamata-anak', false,
     '{"Material":"TR90 fleksibel","Bentuk":"Bundar","Usia":"6 - 12 tahun","Lebar Lensa":"44 mm","Panjang Gagang":"125 mm","Berat":"14 gram"}'::jsonb,
     '2026-08-05T04:00:00Z'::timestamptz),

    ('vesta-square-amber', 'Vesta Square Amber', 'Vesta',
     'Asetat amber transparan yang memperlihatkan gradasi warna saat terkena cahaya. Bentuk persegi tebal untuk tampilan yang lebih berkarakter.',
     512000, null, 9, array['/products/square-amber.svg','/products/square-ink.svg'], 'kacamata-wanita', false,
     '{"Material":"Asetat transparan","Bentuk":"Persegi","Lebar Lensa":"54 mm","Lebar Bridge":"18 mm","Panjang Gagang":"145 mm","Berat":"29 gram"}'::jsonb,
     '2026-08-06T04:00:00Z'::timestamptz),

    ('noir-cateye-sunglasses', 'Noir Cat-Eye Sunglasses', 'Noir',
     'Sunglasses cat-eye dengan lensa gradasi cokelat. Bagian atas lebih gelap untuk menahan matahari dari atas, bagian bawah lebih terang agar pandangan tetap jelas.',
     549000, 699000, 13, array['/products/cateye-sand.svg','/products/cateye-rose.svg'], 'sunglasses', false,
     '{"Material":"Asetat","Bentuk":"Cat-eye","Lensa":"Gradient UV400","Lebar Lensa":"56 mm","Panjang Gagang":"142 mm","Berat":"25 gram"}'::jsonb,
     '2026-07-25T04:00:00Z'::timestamptz),

    ('atlas-titanium-browline', 'Atlas Titanium Browline', 'Atlas',
     'Browline titanium dengan finishing sikat halus. Engsel tanpa sekrup sehingga tidak perlu dikencangkan berkala.',
     1680000, null, 4, array['/products/browline-slate.svg','/products/browline-jade.svg'], 'kacamata-premium', false,
     '{"Material":"Titanium","Bentuk":"Browline","Lebar Lensa":"52 mm","Lebar Bridge":"19 mm","Panjang Gagang":"147 mm","Berat":"15 gram"}'::jsonb,
     '2026-07-15T04:00:00Z'::timestamptz),

    ('lensa-blue-light-single-vision', 'Lensa Blue Light Single Vision', 'Essilor',
     'Lensa minus atau plus dengan lapisan penahan cahaya biru dari layar. Direkomendasikan untuk yang bekerja di depan komputer lebih dari 6 jam sehari.',
     385000, 450000, 60, array['/products/lens-jade.svg','/products/lens-slate.svg'], 'lensa', true,
     '{"Tipe":"Single vision","Indeks":"1.56","Lapisan":"Blue light + anti gores","Rentang Power":"-6.00 s/d +4.00","Garansi":"1 tahun"}'::jsonb,
     '2026-08-02T04:00:00Z'::timestamptz),

    ('lensa-progresif-premium', 'Lensa Progresif Premium', 'Essilor',
     'Tiga jarak pandang dalam satu lensa tanpa garis pemisah: jauh, menengah, dan baca. Perlu masa adaptasi sekitar satu minggu.',
     1850000, 2250000, 25, array['/products/lens-slate.svg','/products/lens-jade.svg'], 'lensa', false,
     '{"Tipe":"Progresif","Indeks":"1.60","Lapisan":"Anti radiasi + anti gores","Rentang Power":"-8.00 s/d +5.00","Garansi":"1 tahun"}'::jsonb,
     '2026-07-11T04:00:00Z'::timestamptz),

    ('lensa-photochromic-transitions', 'Lensa Photochromic Transitions', 'Transitions',
     'Otomatis menggelap saat kena sinar matahari dan bening kembali di dalam ruangan. Satu kacamata untuk dua kebutuhan.',
     975000, null, 30, array['/products/lens-jade.svg','/products/lens-slate.svg'], 'lensa', false,
     '{"Tipe":"Photochromic","Indeks":"1.56","Lapisan":"UV400 + anti gores","Waktu Transisi":"± 30 detik","Garansi":"1 tahun"}'::jsonb,
     '2026-07-08T04:00:00Z'::timestamptz),

    ('orion-rectangle-jade', 'Orion Rectangle Jade', 'Lensara Studio',
     'Hijau jade gelap yang terlihat hitam dari kejauhan, tapi menampakkan warnanya saat kena cahaya. Untuk yang ingin tampil netral dengan sedikit kejutan.',
     349000, null, 27, array['/products/rectangle-jade.svg','/products/rectangle-slate.svg'], 'kacamata-pria', false,
     '{"Material":"Asetat","Bentuk":"Persegi panjang","Lebar Lensa":"54 mm","Lebar Bridge":"18 mm","Panjang Gagang":"145 mm","Berat":"23 gram"}'::jsonb,
     '2026-08-07T02:00:00Z'::timestamptz),

    ('juno-kids-square', 'Juno Kids Square', 'Pixel',
     'Frame persegi ukuran anak dengan nose pad silikon yang tidak melorot saat berlari. Tersedia tali pengaman di dalam paket.',
     259000, null, 16, array['/products/square-amber.svg','/products/round-sand.svg'], 'kacamata-anak', false,
     '{"Material":"TR90 fleksibel","Bentuk":"Persegi","Usia":"8 - 14 tahun","Lebar Lensa":"46 mm","Panjang Gagang":"130 mm","Berat":"15 gram"}'::jsonb,
     '2026-08-03T04:00:00Z'::timestamptz),

    ('dune-aviator-ink', 'Dune Aviator Ink', 'Solano',
     'Aviator dengan finishing hitam doff dan lensa abu pekat. Pilihan yang lebih kalem dibanding versi gold.',
     589000, 720000, 10, array['/products/aviator-ink.svg','/products/aviator-amber.svg'], 'sunglasses', false,
     '{"Material":"Stainless steel","Bentuk":"Aviator","Lensa":"Polarized UV400","Lebar Lensa":"59 mm","Panjang Gagang":"141 mm","Berat":"28 gram"}'::jsonb,
     '2026-08-06T09:00:00Z'::timestamptz),

    ('sena-round-sand', 'Sena Round Sand', 'Lensara Studio',
     'Bundar tipis warna pasir dengan gagang metal. Ringan, hangat, dan cocok untuk wajah dengan garis rahang tegas.',
     325000, 399000, 21, array['/products/round-sand.svg','/products/round-ink.svg'], 'kacamata-wanita', false,
     '{"Material":"Asetat + metal","Bentuk":"Bundar","Lebar Lensa":"48 mm","Lebar Bridge":"20 mm","Panjang Gagang":"143 mm","Berat":"19 gram"}'::jsonb,
     '2026-08-07T01:00:00Z'::timestamptz),

    ('helio-premium-acetate', 'Helio Premium Acetate', 'Vesta',
     'Asetat Jepang yang dipoles tangan selama tiga minggu. Permukaannya tetap mengkilap setelah pemakaian bertahun-tahun.',
     1425000, 1690000, 5, array['/products/square-ink.svg','/products/square-amber.svg'], 'kacamata-premium', false,
     '{"Material":"Asetat Jepang","Bentuk":"Persegi","Lebar Lensa":"53 mm","Lebar Bridge":"19 mm","Panjang Gagang":"146 mm","Berat":"28 gram"}'::jsonb,
     '2026-07-05T04:00:00Z'::timestamptz)
)
insert into public.products
  (slug, name, brand, description, price, compare_at_price, stock,
   images, category_id, is_featured, specs, created_at)
select s.slug, s.name, s.brand, s.description, s.price, s.compare_at_price, s.stock,
       s.images, c.id, s.is_featured, s.specs, s.created_at
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
  specs            = excluded.specs;

-- Ringkasan hasil
select
  (select count(*) from public.categories) as total_kategori,
  (select count(*) from public.products)   as total_produk;
