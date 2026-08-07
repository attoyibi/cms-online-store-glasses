-- =============================================================
--  v1 · 03 · STORAGE
--
--  Bucket tempat foto produk diunggah dari halaman admin
--  (komponen ImageUploader). Bucket dibuat publik agar URL-nya
--  bisa langsung dipakai <Image> tanpa signed URL.
--
--  Jalankan setelah 02_rls.sql. Aman dijalankan ulang.
-- =============================================================

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
