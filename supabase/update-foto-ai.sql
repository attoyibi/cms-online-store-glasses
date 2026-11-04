-- Ganti foto SVG lama dengan foto contoh buatan AI (hanya baris yang masih memakai /products/*.svg,
-- jadi foto yang sudah Anda ganti sendiri lewat Admin tidak tertimpa). Aman dijalankan berulang.
-- Jalankan di Supabase SQL Editor SETELAH deploy yang membawa file /products/*.webp.

update public.categories set image_url = '/products/arka-square-matte-black-1.webp' where slug = 'kacamata-pria' and image_url like '%.svg';
update public.categories set image_url = '/products/nadira-cateye-rose-1.webp' where slug = 'kacamata-wanita' and image_url like '%.svg';
update public.categories set image_url = '/products/pixel-kids-flex-round-1.webp' where slug = 'kacamata-anak' and image_url like '%.svg';
update public.categories set image_url = '/products/solano-aviator-gold-1.webp' where slug = 'sunglasses' and image_url like '%.svg';
update public.categories set image_url = '/products/atlas-titanium-browline-1.webp' where slug = 'kacamata-premium' and image_url like '%.svg';
update public.categories set image_url = '/products/lensa-progresif-premium-1.webp' where slug = 'lensa' and image_url like '%.svg';
update public.categories set image_url = '/products/lap-microfiber-serat-halus-1.webp' where slug = 'lap-kacamata' and image_url like '%.svg';

update public.products set images = array['/products/arka-square-matte-black-1.webp','/products/arka-square-matte-black-2.webp'] where slug = 'arka-square-matte-black' and exists (select 1 from unnest(images) u where u like '%.svg');
update public.products set images = array['/products/nadira-cateye-rose-1.webp','/products/nadira-cateye-rose-2.webp'] where slug = 'nadira-cateye-rose' and exists (select 1 from unnest(images) u where u like '%.svg');
update public.products set images = array['/products/kavi-round-titanium-1.webp','/products/kavi-round-titanium-2.webp'] where slug = 'kavi-round-titanium' and exists (select 1 from unnest(images) u where u like '%.svg');
update public.products set images = array['/products/solano-aviator-gold-1.webp','/products/solano-aviator-gold-2.webp'] where slug = 'solano-aviator-gold' and exists (select 1 from unnest(images) u where u like '%.svg');
update public.products set images = array['/products/brio-browline-jade-1.webp','/products/brio-browline-jade-2.webp'] where slug = 'brio-browline-jade' and exists (select 1 from unnest(images) u where u like '%.svg');
update public.products set images = array['/products/mira-rectangle-slate-1.webp','/products/mira-rectangle-slate-2.webp'] where slug = 'mira-rectangle-slate' and exists (select 1 from unnest(images) u where u like '%.svg');
update public.products set images = array['/products/pixel-kids-flex-round-1.webp','/products/pixel-kids-flex-round-2.webp'] where slug = 'pixel-kids-flex-round' and exists (select 1 from unnest(images) u where u like '%.svg');
update public.products set images = array['/products/vesta-square-amber-1.webp','/products/vesta-square-amber-2.webp'] where slug = 'vesta-square-amber' and exists (select 1 from unnest(images) u where u like '%.svg');
update public.products set images = array['/products/noir-cateye-sunglasses-1.webp','/products/noir-cateye-sunglasses-2.webp'] where slug = 'noir-cateye-sunglasses' and exists (select 1 from unnest(images) u where u like '%.svg');
update public.products set images = array['/products/atlas-titanium-browline-1.webp','/products/atlas-titanium-browline-2.webp'] where slug = 'atlas-titanium-browline' and exists (select 1 from unnest(images) u where u like '%.svg');
update public.products set images = array['/products/lensa-blue-light-single-vision-1.webp','/products/lensa-blue-light-single-vision-2.webp'] where slug = 'lensa-blue-light-single-vision' and exists (select 1 from unnest(images) u where u like '%.svg');
update public.products set images = array['/products/lensa-progresif-premium-1.webp','/products/lensa-progresif-premium-2.webp'] where slug = 'lensa-progresif-premium' and exists (select 1 from unnest(images) u where u like '%.svg');
update public.products set images = array['/products/lensa-photochromic-transitions-1.webp','/products/lensa-photochromic-transitions-2.webp'] where slug = 'lensa-photochromic-transitions' and exists (select 1 from unnest(images) u where u like '%.svg');
update public.products set images = array['/products/orion-rectangle-jade-1.webp','/products/orion-rectangle-jade-2.webp'] where slug = 'orion-rectangle-jade' and exists (select 1 from unnest(images) u where u like '%.svg');
update public.products set images = array['/products/juno-kids-square-1.webp','/products/juno-kids-square-2.webp'] where slug = 'juno-kids-square' and exists (select 1 from unnest(images) u where u like '%.svg');
update public.products set images = array['/products/dune-aviator-ink-1.webp','/products/dune-aviator-ink-2.webp'] where slug = 'dune-aviator-ink' and exists (select 1 from unnest(images) u where u like '%.svg');
update public.products set images = array['/products/sena-round-sand-1.webp','/products/sena-round-sand-2.webp'] where slug = 'sena-round-sand' and exists (select 1 from unnest(images) u where u like '%.svg');
update public.products set images = array['/products/helio-premium-acetate-1.webp','/products/helio-premium-acetate-2.webp'] where slug = 'helio-premium-acetate' and exists (select 1 from unnest(images) u where u like '%.svg');
update public.products set images = array['/products/lap-microfiber-serat-halus-1.webp','/products/lap-microfiber-serat-halus-2.webp'] where slug = 'lap-microfiber-serat-halus' and exists (select 1 from unnest(images) u where u like '%.svg');
update public.products set images = array['/products/lap-microfiber-set-3-1.webp','/products/lap-microfiber-set-3-2.webp'] where slug = 'lap-microfiber-set-3' and exists (select 1 from unnest(images) u where u like '%.svg');
