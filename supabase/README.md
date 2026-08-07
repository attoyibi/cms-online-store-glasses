# Database Supabase

SQL untuk menyiapkan database CMS toko kacamata. Semuanya dijalankan dengan
**copy-paste ke Supabase Dashboard → SQL Editor → New query → Run**.

## Aturan versi

Setiap perubahan skema masuk ke **folder versi baru**. Folder versi lama
**tidak pernah dihapus atau diubah** — supaya proyek yang sudah terlanjur
jalan dengan versi lama tetap punya rujukan, dan urutan perubahannya
bisa ditelusuri.

```
supabase/
├─ README.md      ← file ini
├─ v1/            ← versi awal (JANGAN diubah lagi)
├─ v2/            ← atribut filter (JANGAN diubah lagi)
└─ v3/            ← perubahan berikutnya ditaruh di sini
```

Kalau nanti perlu menambah kolom atau tabel: buat folder versi berikutnya,
isi dengan `ALTER TABLE …` seperlunya saja — **bukan** salinan lengkap
versi sebelumnya.

Versi yang sudah dijalankan tercatat di tabel `schema_versions`:

```sql
select * from public.schema_versions order by applied_at;
```

## Versi 1 — urutan menjalankan

Jalankan berurutan. Semuanya aman dijalankan ulang (idempoten).

| # | File | Isi | Wajib? |
| - | ---- | --- | ------ |
| 1 | [`v1/01_schema.sql`](v1/01_schema.sql) | Tabel, index, trigger, fungsi `is_admin()` | ✅ |
| 2 | [`v1/02_rls.sql`](v1/02_rls.sql) | Row Level Security + policy | ✅ |
| 3 | [`v1/03_storage.sql`](v1/03_storage.sql) | Bucket `product-images` untuk foto produk | ✅ |
| 4 | [`v1/04_seed.sql`](v1/04_seed.sql) | 6 kategori + 18 produk contoh | opsional |
| — | [`v1/99_reset.sql`](v1/99_reset.sql) | ⚠️ Hapus semua, untuk mulai dari nol | jangan disentuh |

## Versi 2 — atribut filter

Menambahkan data terstruktur yang menggerakkan filter katalog. Tanpa ini
katalog tetap tampil, hanya tanpa filter.

| # | File | Isi | Wajib? |
| - | ---- | --- | ------ |
| 1 | [`v2/01_attributes.sql`](v2/01_attributes.sql) | Tabel atribut, relasi ke produk, kolom lebar lensa, RLS | ✅ |
| 2 | [`v2/02_seed_attributes.sql`](v2/02_seed_attributes.sql) | Daftar bentuk/material/warna + pemasangan ke produk contoh | ✅ |

**Kenapa perlu tabel sendiri?** Sampai v1, detail produk hanya ada di kolom
`specs` berupa JSON bebas. Bagus untuk ditampilkan, tapi tidak bisa
difilter — "Asetat premium", "asetat", dan "Acetate" akan jadi tiga opsi
filter berbeda untuk barang yang sama. Dengan v2, admin **memilih** dari
daftar, bukan mengetik. Kolom `specs` tetap ada dan tidak berubah.

Opsi filter baru bisa ditambah kapan saja lewat **/admin/atribut** tanpa
perlu menjalankan SQL lagi.

### Setelah SQL selesai

1. **Project Settings → API** — salin `Project URL` dan `anon public key`
   ke `.env.local` di root proyek:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
   ```

2. **Authentication → Users → Add user** — buat akun untuk login admin.
   Centang *Auto Confirm User* supaya tidak perlu verifikasi email.

3. **Daftarkan akun itu sebagai admin.** Ini langkah yang paling sering
   terlewat — tanpa ini, login berhasil tapi semua data gagal dimuat,
   karena RLS menolak siapa pun yang tidak ada di tabel `admins`:

   ```sql
   insert into public.admins (user_id, email)
   select id, email from auth.users where email = 'email-anda@contoh.com'
   on conflict (user_id) do nothing;
   ```

4. Restart `npm run dev`, lalu buka `/admin/login`.

## Struktur data

| Tabel | Isi |
| ----- | --- |
| `admins` | Daftar user yang boleh mengelola CMS |
| `categories` | Kategori produk (`sort_order` menentukan urutan di beranda) |
| `products` | Produk. `price` dalam rupiah penuh (bukan sen), `specs` berupa JSON bebas |
| `store_settings` | Baris tunggal: nama toko, nomor WhatsApp, alamat, pengumuman |
| `product_attributes` | Daftar pilihan filter: bentuk, material, warna |
| `product_attribute_links` | Atribut mana dipakai produk mana (many-to-many) |
| `schema_versions` | Catatan versi migrasi yang sudah dijalankan |

## Model keamanan

- Pengunjung tanpa login hanya bisa **membaca** baris yang `is_active = true`.
- Menulis (insert/update/delete) hanya bisa dilakukan user yang `user_id`-nya
  terdaftar di tabel `admins` — dicek lewat fungsi `public.is_admin()`.
- `store_settings` boleh dibaca siapa saja, karena nomor WhatsApp dan alamat
  memang ditampilkan di footer situs.
- Foto di bucket `product-images` bisa dilihat publik, tapi hanya admin yang
  boleh mengunggah atau menghapus.

Karena semua aturan ada di level database, kunci `anon` yang terekspos di
browser tidak bisa dipakai untuk mengubah data.
