-- =============================================================
--  RESET — MENGHAPUS SEMUA DATA TOKO
--
--  JANGAN jalankan di toko yang sudah dipakai.
--
--  File ini menghapus seluruh tabel, fungsi, dan bucket yang dibuat
--  setup.sql — termasuk semua produk, kategori, varian, halaman
--  depan, dan pengaturan. Tidak bisa dibatalkan.
--
--  Gunanya hanya saat uji coba, bila Anda ingin mulai dari nol
--  lalu menjalankan setup.sql lagi.
--
--  Dua hal yang TIDAK ikut terhapus dan harus dibereskan manual:
--    · Akun login  → Dashboard → Authentication → Users
--    · File gambar → Dashboard → Storage (menghapus baris di
--      storage.objects tidak menghapus file fisiknya)
--
--  Cara pakai: hapus tanda komentar pada blok di bawah, lalu
--  jalankan. Sengaja dikomentari agar tidak terjalankan karena
--  tidak sengaja menekan Run.
-- =============================================================

/*

drop policy if exists "product images public read" on storage.objects;
drop policy if exists "product images admin write" on storage.objects;
delete from storage.objects where bucket_id = 'product-images';
delete from storage.buckets where id = 'product-images';

drop table if exists public.site_page_drafts        cascade;
drop table if exists public.site_pages              cascade;
drop table if exists public.product_variants        cascade;
drop table if exists public.product_attribute_links cascade;
drop table if exists public.product_attributes      cascade;
drop table if exists public.products                cascade;
drop table if exists public.categories              cascade;
drop table if exists public.store_settings          cascade;
drop table if exists public.admins                  cascade;
drop table if exists public.schema_versions         cascade;

drop function if exists public.is_admin();
drop function if exists public.touch_updated_at();

*/
