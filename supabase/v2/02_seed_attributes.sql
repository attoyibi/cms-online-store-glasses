-- =============================================================
--  v2 · 02 · ISI DAFTAR ATRIBUT
--
--  Bagian A (daftar pilihan) sebaiknya SELALU dijalankan — ini
--  yang mengisi opsi filter di katalog dan dropdown di admin.
--  Nanti opsi tambahan bisa dibuat lewat /admin/atribut.
--
--  Bagian B (pemasangan ke produk) hanya berpengaruh kalau Anda
--  menjalankan v1/04_seed.sql. Kalau produknya Anda isi sendiri,
--  bagian ini tidak melakukan apa-apa dan aman dilewati.
--
--  Aman dijalankan ulang.
-- =============================================================

-- =============================================================
--  BAGIAN A — Daftar pilihan
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
--  BAGIAN B — Pasang ke produk contoh
--  (dilewati otomatis kalau produknya tidak ada)
-- =============================================================

-- Lebar lensa, diambil dari kolom specs milik produk contoh.
-- Produk lensa tidak punya nilai ini, jadi tidak ikut didaftar.
with widths(product_slug, mm) as (
  values
    ('arka-square-matte-black', 52),
    ('nadira-cateye-rose',      50),
    ('kavi-round-titanium',     47),
    ('solano-aviator-gold',     58),
    ('brio-browline-jade',      51),
    ('mira-rectangle-slate',    53),
    ('pixel-kids-flex-round',   44),
    ('vesta-square-amber',      54),
    ('noir-cateye-sunglasses',  56),
    ('atlas-titanium-browline', 52),
    ('orion-rectangle-jade',    54),
    ('juno-kids-square',        46),
    ('dune-aviator-ink',        59),
    ('sena-round-sand',         48),
    ('helio-premium-acetate',   53)
)
update public.products p
set lens_width_mm = w.mm
from widths w
where p.slug = w.product_slug;

-- Pemasangan atribut. Satu produk boleh punya beberapa material
-- atau warna — cukup tulis beberapa baris untuk slug yang sama.
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
  (select count(*) from public.product_attributes)      as opsi_filter,
  (select count(*) from public.product_attribute_links) as pemasangan,
  (select count(*) from public.products
     where lens_width_mm is not null)                   as produk_berukuran;
