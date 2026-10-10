# Database Supabase

SQL untuk menyiapkan database CMS toko kacamata. Semuanya dijalankan dengan
**copy-paste ke Supabase Dashboard → SQL Editor → New query → Run**.

## Setup baru? Pakai v3 — cuma 2 file

```
supabase/
├─ README.md      ← file ini
├─ v1/            ← riwayat (JANGAN diubah lagi)
├─ v2/            ← riwayat (JANGAN diubah lagi)
└─ v3/            ← pakai ini untuk setup baru
```

`v3` menggabungkan seluruh isi `v1` + `v2` jadi dua file saja, supaya
setup awal cukup dua kali copy-paste, bukan enam:

| # | File | Isi | Wajib? |
| - | ---- | --- | ------ |
| 1 | [`v3/01_schema.sql`](v3/01_schema.sql) | Semua tabel, index, trigger, RLS, dan bucket storage | ✅ |
| 2 | [`v3/02_seed.sql`](v3/02_seed.sql) | 6 kategori, 18 produk contoh, dan atribut filternya | opsional |

Isinya secara fungsional identik dengan menjalankan `v1/01` → `v1/02` →
`v1/03` → `v2/01`, lalu `v1/04` → `v2/02`. Kalau database Anda memang
masih kosong, jalankan `v3` saja dan lewati `v1`/`v2` sama sekali.

`v1` dan `v2` tetap ada di repo sebagai riwayat — untuk proyek yang
kebetulan sudah terlanjur menjalankannya secara terpisah sebelum `v3`
ada. Isinya tidak akan diubah lagi.

## Sudah pakai v3? Tambahkan v4 (varian produk)

`v4` menambah **varian produk**: satu produk bisa punya beberapa pilihan dengan
harga & stok sendiri — terutama untuk lensa, yang harganya bergantung ukuran
minus/plus. Folder ini hanya berisi perubahan dari v3, jalankan **setelah v3**:

| # | File | Isi | Wajib? |
| - | ---- | --- | ------ |
| 1 | [`v4/01_variants.sql`](v4/01_variants.sql) | Tabel `product_variants` + RLS | ✅ untuk fitur varian |
| 2 | [`v4/02_seed_lap_lensa.sql`](v4/02_seed_lap_lensa.sql) | Kategori & 2 produk Lap Kacamata, varian untuk 3 lensa contoh | opsional |

Keduanya aman dijalankan ulang. Beberapa hal yang perlu diketahui:

- **Situs tetap jalan sebelum v4 dijalankan** — produk biasa tidak terpengaruh,
  hanya varian yang belum bisa disimpan (admin akan menampilkan pesan yang jelas).
- Untuk produk **bervarian**, kolom `products.price` berisi harga termurah dan
  `products.stock` jumlah stok semua varian. Halaman admin mengisinya otomatis;
  tujuannya agar urutan harga dan filter harga di katalog tetap benar.
- Kategori & produk di `02_seed_lap_lensa.sql` memakai `on conflict do nothing`,
  jadi **tidak menimpa** hasil edit Anda di CMS. Kalau Anda sudah punya kategori
  `lap-kacamata`, isinya dibiarkan.
- Menjalankan ulang `v3/02_seed.sql` akan **mengembalikan harga** tiga produk
  lensa ke harga lama (seed-nya meng-upsert harga). Bila itu terjadi, jalankan
  `v4/02_seed_lap_lensa.sql` lagi — bagian terakhirnya menghitung ulang harga
  dan stok dari varian.

Cara mengisi varian dari CMS: buka **Admin → Produk → Edit**, isi kolom
**Varian**, satu baris per varian dengan format `Label | harga | stok | harga coret`
(stok dan harga coret boleh dikosongkan), mis.:

```
Minus 0,25 – 4,00 | 250000 | 40
Minus 4,25 – 6,00 | 350000 | 25
Minus 6,25 – 8,00 | 450000 | 10 | 500000
```

## Aturan versi

Setiap perubahan skema masuk ke **folder versi baru**. Folder versi lama
**tidak pernah dihapus atau diubah** — supaya proyek yang sudah terlanjur
jalan dengan versi lama tetap punya rujukan, dan urutan perubahannya
bisa ditelusuri.

Kalau nanti perlu menambah kolom atau tabel: buat `v4/`, isi dengan
`ALTER TABLE …` seperlunya saja — **bukan** salinan lengkap versi
sebelumnya (itu yang membuat `v3` istimewa: dia sengaja dibuat sebagai
bundel konsolidasi sekali jalan, bukan pola yang diulang tiap versi).

Versi yang sudah dijalankan tercatat di tabel `schema_versions`. `v3`
mencatat baris `v1`, `v2`, dan `v3` sekaligus karena isinya setara:

```sql
select * from public.schema_versions order by applied_at;
```

### Setelah SQL selesai

1. **Project Settings → API** — salin `Project URL` dan `Publishable key`
   (atau `anon public key` di proyek lama) ke `.env.local` di root proyek:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
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

## Riwayat versi (v1 + v2)

<details>
<summary>Buka kalau perlu menjalankan v1/v2 secara terpisah</summary>

### v1 — skema awal

| # | File | Isi | Wajib? |
| - | ---- | --- | ------ |
| 1 | [`v1/01_schema.sql`](v1/01_schema.sql) | Tabel, index, trigger, fungsi `is_admin()` | ✅ |
| 2 | [`v1/02_rls.sql`](v1/02_rls.sql) | Row Level Security + policy | ✅ |
| 3 | [`v1/03_storage.sql`](v1/03_storage.sql) | Bucket `product-images` untuk foto produk | ✅ |
| 4 | [`v1/04_seed.sql`](v1/04_seed.sql) | 6 kategori + 18 produk contoh | opsional |
| — | [`v1/99_reset.sql`](v1/99_reset.sql) | ⚠️ Hapus semua, untuk mulai dari nol | jangan disentuh |

### v2 — atribut filter

| # | File | Isi | Wajib? |
| - | ---- | --- | ------ |
| 1 | [`v2/01_attributes.sql`](v2/01_attributes.sql) | Tabel atribut, relasi ke produk, kolom lebar lensa, RLS | ✅ |
| 2 | [`v2/02_seed_attributes.sql`](v2/02_seed_attributes.sql) | Daftar bentuk/material/warna + pemasangan ke produk contoh | ✅ |

</details>

**Kenapa atribut perlu tabel sendiri?** Sampai v1, detail produk hanya ada
di kolom `specs` berupa JSON bebas. Bagus untuk ditampilkan, tapi tidak
bisa difilter — "Asetat premium", "asetat", dan "Acetate" akan jadi tiga
opsi filter berbeda untuk barang yang sama. Sejak v2, admin **memilih**
dari daftar, bukan mengetik. Kolom `specs` tetap ada dan tidak berubah.

Opsi filter baru bisa ditambah kapan saja lewat **/admin/atribut** tanpa
perlu menjalankan SQL lagi.

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

Karena semua aturan ada di level database, kunci publik yang terekspos di
browser tidak bisa dipakai untuk mengubah data.
