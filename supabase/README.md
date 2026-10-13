# Database Supabase

Semua yang dibutuhkan database ada di **satu file: [`setup.sql`](setup.sql)**.
Dijalankan dengan copy-paste di **Supabase Dashboard → SQL Editor → New query → Run**.

```
supabase/
├─ setup.sql       SATU file untuk semua: pasang baru dan pembaruan
├─ seed-demo.sql   Data contoh (opsional)
├─ reset.sql       Hapus semuanya — hanya untuk uji coba (dikomentari)
└─ README.md       File ini
```

## Memasang toko baru

1. Buat proyek di [supabase.com](https://supabase.com/dashboard).
2. **SQL Editor** → tempel seluruh isi [`setup.sql`](setup.sql) → **Run**.
   Hasil yang benar: satu baris ringkasan dengan `tabel_terpasang_dari_13 = 13`
   dan status `LANGKAH BERIKUTNYA: daftarkan akun admin`.
3. **Authentication → Users → Add user**, isi email dan password, dan centang
   **Auto Confirm User**.
4. Daftarkan akun itu sebagai admin. **Wajib** — tanpa ini login berhasil, tapi
   semua data ditolak oleh RLS. Jalankan di SQL Editor (ganti emailnya):

   ```sql
   insert into public.admins (user_id, email)
   select id, email from auth.users where email = 'email-anda@contoh.com'
   on conflict (user_id) do nothing;
   ```
5. **Authentication → Sign In / Providers** → matikan **Allow new users to sign up**,
   supaya orang asing tidak bisa membuat akun.
6. **Project Settings → API** → salin *Project URL* dan *Publishable key*, lalu
   isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   (di `.env.local`, dan di Cloudflare → Settings → **Build** → *Build variables*).
7. Masuk di `/admin/login`, lalu isi **Admin → Pengaturan** (nama toko, nomor
   WhatsApp, alamat). **Pastikan nomor WhatsApp-nya benar** — itu tujuan semua
   pesanan pelanggan.

Data contoh (produk dan kategori demo) opsional: jalankan
[`seed-demo.sql`](seed-demo.sql) setelah `setup.sql`. Untuk toko sungguhan,
lewati saja dan isi produk dari admin.

## Memperbarui toko yang sudah berjalan

Jalankan **`setup.sql` lagi**, seluruhnya. Itu saja.

- **Aman berapa kali pun.** Isinya hanya membuat yang belum ada. Produk,
  kategori, varian, halaman depan, pengaturan, admin, dan foto **tidak disentuh**.
- Berlaku untuk database dari versi mana pun: yang dulu dipasang dengan
  `v1`/`v2`, `v3`, `v4`, atau `v5` semuanya naik ke keadaan terbaru.
- Dijalankan sebagai satu transaksi: kalau ada yang gagal, tidak ada yang
  berubah setengah-setengah.

Setiap kali aplikasi ditambah fitur yang butuh perubahan database, perubahannya
ditambahkan ke `setup.sql` dan Anda cukup menjalankannya lagi.

## Data contoh

[`seed-demo.sql`](seed-demo.sql) mengisi 7 kategori, 20 produk (termasuk Lap
Kacamata dan tiga lensa bervarian), 20 opsi filter, dan satu pengaturan toko demo.

- Aman dijalankan berulang dan **tidak menimpa edit Anda**: harga, nama, atau
  stok yang sudah Anda ubah di CMS tetap dipertahankan.
- Pengaturan toko demo hanya dibuat bila belum ada, dengan nomor WhatsApp
  **contoh** — ganti di Admin → Pengaturan sebelum dipakai.
- Menghapus data demo: hapus produk dan kategorinya dari Admin.

## Mulai dari nol lagi (uji coba)

[`reset.sql`](reset.sql) menghapus semua tabel dan bucket. Isinya sengaja
dikomentari. Jangan dipakai di toko yang sudah berjalan. Setelah itu jalankan
`setup.sql` lagi.

## Menambah perubahan skema (untuk pengembang)

Satu file, selalu idempoten. Aturannya:

1. Tambahkan perubahan **di `setup.sql`**, bukan file baru. Pakai bentuk yang aman
   diulang: `create table if not exists`, `alter table … add column if not exists`,
   `create or replace function`, `drop policy if exists` + `create policy`,
   `on conflict do nothing`.
2. Untuk kolom baru di tabel yang sudah ada, `create table if not exists` saja
   **tidak cukup** (tabel lama dilewati). Tambahkan juga `alter table … add column
   if not exists`, seperti yang sudah dilakukan untuk `lens_width_mm`.
3. Tambahkan satu baris di bagian *Pencatatan versi* (`v7`, `v8`, …).
4. Uji dua hal: dijalankan di database **kosong**, dan dijalankan **dua kali**
   di database yang sudah berisi data (data harus utuh).

## Keamanan

RLS aktif di semua tabel: publik hanya membaca yang aktif atau terbit; hanya akun
yang terdaftar di tabel `admins` yang bisa menulis. Draft halaman depan ada di
tabel terpisah yang hanya bisa dibaca admin. Akun admin baru **tidak bisa**
mendaftarkan dirinya sendiri; penambahan admin selalu lewat SQL Editor.
