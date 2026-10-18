# CMS Online Store Glasses

Toko kacamata online dengan CMS. Pengunjung memilih produk lalu mengirim pesanannya
lewat WhatsApp — **tidak ada pembayaran di dalam situs**. Admin mengelola katalog
lewat halaman `/admin` yang dilindungi login.

**Demo langsung:** https://cms-online-store-glasses.muhammadmuchson.workers.dev/

## Stack

| Bagian      | Teknologi                                              |
| ----------- | ------------------------------------------------------ |
| Framework   | Next.js 16 (App Router, Turbopack) + React 19           |
| Styling     | Tailwind CSS v4 + shadcn/ui (`radix-nova`)              |
| Backend     | Supabase (Postgres + Auth + Storage)                   |
| Deploy      | Cloudflare Workers via `@opennextjs/cloudflare`         |
| Font        | Plus Jakarta Sans                                       |

## Fitur

**Untuk pengunjung (tanpa login)**

- Landing page: hero, kategori, best seller, koleksi terbaru, lensa, cara pesan, testimoni, FAQ
- Katalog dengan pencarian, pengurutan, dan filter (state ada di URL, bisa dibagikan)
- Filter bentuk frame yang visual — ikon kacamata, bukan daftar centang
- Halaman kategori dan detail produk lengkap dengan spesifikasi
- Varian produk dengan harga & stok per pilihan (mis. ukuran lensa), tampil sebagai rentang harga
- Keranjang yang bertahan di `localStorage` dan sinkron antar tab; varian berbeda = baris berbeda
- "Terakhir Anda lihat" di halaman produk, tersimpan di perangkat pengunjung
- Kategori kosong menampilkan keterangan jelas, lalu rekomendasi yang diberi label terpisah
- Halaman depan tersusun dari blok yang bisa diatur admin (lihat di bawah)
- Checkout → menyusun rincian pesanan menjadi pesan WhatsApp

**Untuk admin (perlu login)**

- Ringkasan: jumlah produk, kategori, dan daftar stok menipis
- CRUD produk — termasuk unggah gambar ke Supabase Storage, harga coret, spesifikasi bebas, dan varian
- CRUD kategori dengan pengaturan urutan tampil
- Kelola opsi filter (bentuk, material, warna) tanpa perlu menyentuh SQL
- Pengaturan toko: nama, nomor WhatsApp, alamat, jam buka, dan bar pengumuman
- **Tema warna**: pilih salah satu dari 6 tema (Jade bawaan, Biru Laut, Mawar, Karamel, Ungu, Hitam Putih), lalu sesuaikan warna utama, sekunder, aksen, latar, teks, serta warna per komponen (bar pengumuman, footer, tombol WhatsApp, label diskon) dengan pratinjau langsung. Tersimpan di Supabase (`store_settings.theme` dan `theme_colors`, butuh `supabase/setup.sql` v10); hanya mengubah situs toko, panel admin tetap hijau. Menambah tema baru cukup menambah satu entri di `src/lib/themes.ts`, tanpa SQL
- **Halaman Depan**: halaman depan tersusun dari blok (hero, keunggulan, kategori, deretan produk, tentang, lensa, cara pesan, testimoni, FAQ, banner). Editornya menampilkan **pratinjau langsung** halaman asli di sebelah form (mode Desktop/Tablet/HP): klik bagian mana pun untuk mengeditnya dan hasilnya langsung terlihat. Admin bisa mengedit isi tiap blok, mengubah urutan, menyembunyikan, menduplikasi, dan menambah blok baru, dengan **undo/redo** (Ctrl+Z), draft, lalu terbitkan. Butuh `supabase/setup.sql`

## Menjalankan secara lokal

Butuh **Node.js 20.9+** (repo ini memakai `.nvmrc` → Node 22).

```bash
nvm use && npm install && npm run dev
```

Buka http://localhost:3000.

Tanpa kredensial Supabase, situs tetap jalan memakai data contoh di
`src/lib/data/sample-data.ts`. Halaman `/admin` akan menampilkan panduan setup.

## Menghubungkan Supabase

1. Buat proyek di [supabase.com](https://supabase.com/dashboard).
2. SQL Editor → tempel isi **`supabase/setup.sql`** lalu Run. Cukup satu file,
   dan **aman dijalankan berulang** (toko baru maupun pembaruan toko lama; data
   tidak disentuh). Data contoh opsional: `supabase/seed-demo.sql`. Detail dan
   cara memperbarui ada di [`supabase/README.md`](supabase/README.md).
3. Salin `.env.example` menjadi `.env.local`, isi `NEXT_PUBLIC_SUPABASE_URL` dan
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (Project Settings → API).
4. Authentication → Users → **Add user**, buat akun admin.
5. Daftarkan akun itu sebagai admin — **langkah ini wajib**, tanpa ini login
   berhasil tapi semua data gagal dimuat karena ditolak RLS:

   ```sql
   insert into public.admins (user_id, email)
   select id, email from auth.users where email = 'email-anda@contoh.com'
   on conflict (user_id) do nothing;
   ```

6. Restart `npm run dev`, lalu masuk lewat `/admin/login`.

Row Level Security sudah aktif: publik hanya bisa **membaca** data yang `is_active`,
dan hanya user yang terdaftar di tabel `admins` yang bisa menulis.

Penjelasan tiap file SQL dan aturan penambahan versi ada di
[`supabase/README.md`](supabase/README.md).

## Deploy ke Cloudflare

### Dari komputer sendiri

```bash
npx wrangler login
npm run deploy
```

### Lewat Workers Builds (deploy otomatis dari GitHub)

Tidak ada yang perlu diubah — biarkan build command `npm run build` dan
deploy command `npx wrangler deploy` sesuai bawaannya.

Supaya itu bisa terjadi, `build` sengaja menunjuk ke
`opennextjs-cloudflare build`, bukan `next build`. Perintah itulah yang
menghasilkan folder `.open-next/` berisi bundle Worker; tanpanya tahap
deploy gagal dengan:

> Could not find compiled Open Next config, did you run the build command?

> **Jangan hapus `buildCommand` di `open-next.config.ts`.**
> Bawaannya OpenNext menjalankan `npm run build` untuk membangun aplikasi
> Next.js. Karena script `build` justru memanggil OpenNext, tanpa baris
> itu perintahnya akan memanggil dirinya sendiri tanpa henti — build
> menggantung sampai kehabisan proses. `buildCommand: "npx next build"`
> yang memutus rantai tersebut.

### Variabel lingkungan

Set di **Dashboard → Settings → Build → "Build variables and secrets"**
sebelum deploy pertama:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `NEXT_PUBLIC_SITE_URL`

> **Jangan tertukar dengan Settings → Variables & Secrets.** Bagian itu untuk
> variabel *runtime*, dan tidak akan berpengaruh di sini: Next.js menanam nilai
> `NEXT_PUBLIC_*` ke dalam kode saat `next build`, jadi yang dibaca adalah
> variabel yang tersedia saat **build**. Dokumentasi Cloudflare menegaskan
> *"Build variables will not be accessible at runtime"* — dan sebaliknya.
>
> Gejala kalau salah tempat: nilainya kelihatan sudah diisi di Dashboard, tapi
> situs tetap menampilkan data contoh — dan variabelnya hilang setiap deploy,
> karena `wrangler.jsonc` menimpa binding runtime yang tidak tercantum di sana.
> Build variables tidak ikut terhapus.

> **Catatan macOS:** `npm run preview` dan `npm run cf-typegen` menjalankan `workerd`
> secara lokal, yang butuh **macOS 13.5+**. `npm run deploy` tidak terpengaruh karena
> proses build-nya berjalan di Node, bukan di workerd.

## Perintah

| Perintah             | Kegunaan                                          |
| -------------------- | ------------------------------------------------- |
| `npm run dev`        | Server pengembangan                               |
| `npm run build`      | Build + bundle Worker Cloudflare ke `.open-next/`  |
| `npm run build:next` | Hanya `next build`, untuk pengecekan cepat        |
| `npm run lint`       | ESLint                                            |
| `npm run typecheck`  | `tsc --noEmit`                                    |
| `npm run deploy`     | Build + deploy ke Cloudflare Workers              |
| `npm run preview`    | Pratinjau di runtime Workers (butuh macOS 13.5+)  |
| `npm run gen:images` | Buat ulang ilustrasi SVG di `public/products`     |

## Struktur

```
src/
├─ app/
│  ├─ (shop)/            Halaman publik — beranda, katalog, checkout
│  ├─ admin/             CMS: dashboard, produk, kategori, pengaturan
│  ├─ layout.tsx         Font, metadata, provider pengaturan toko
│  └─ globals.css        Token warna & tema Tailwind v4
├─ components/
│  ├─ admin/             Form dan navigasi CMS
│  ├─ cart/              Provider, panel keranjang, form checkout
│  ├─ catalog/           Bar filter, ikon bentuk, grid produk
│  ├─ layout/            Header, footer, tombol WhatsApp mengambang
│  ├─ product/           Kartu produk, galeri, tombol tambah
│  ├─ sections/          Section landing page
│  └─ ui/                Komponen shadcn/ui
├─ lib/
│  ├─ data/              Query Supabase + data contoh
│  ├─ supabase/          Client browser/server, guard admin, middleware
│  ├─ cart-store.ts      External store keranjang (localStorage)
│  ├─ filters.ts         Definisi filter, penyaringan, penghitung facet
│  ├─ whatsapp.ts        Penyusun pesan & tautan wa.me
│  └─ site-config.ts     Identitas toko (default)
└─ middleware.ts         Penyegar sesi + penjaga rute /admin

supabase/
├─ setup.sql             SATU file untuk semua: pasang baru & pembaruan (idempoten)
├─ seed-demo.sql         Data contoh (opsional, tidak menimpa edit Anda)
├─ reset.sql             Hapus semuanya — hanya untuk uji coba (dikomentari)
└─ README.md             Panduan lengkap
```

Penyaringan dan penghitungan jumlah per opsi dikerjakan di `lib/filters.ts`,
bukan lewat SQL per-facet. Alasannya: jalur data contoh dan Supabase jadi
berperilaku sama persis, angka di tiap opsi selalu konsisten dengan hasil
yang tampil, dan menambah facet baru tidak perlu mengubah query. Cara ini
nyaman sampai sekitar seribu produk per kategori; di atas itu perlu
dipindah ke agregasi di database.

> **Kenapa masih `middleware.ts`, bukan `proxy.ts`?**
> Next.js 16 mengganti namanya menjadi `proxy.ts`, tapi `proxy` selalu berjalan di
> runtime Node.js dan `@opennextjs/cloudflare` belum mendukungnya — `npm run deploy`
> akan gagal dengan _"Node.js middleware is not currently supported"_. Nama lama
> dipertahankan agar tetap berjalan di edge runtime. Ganti namanya setelah adapter
> Cloudflare mendukung Node middleware.

## Keamanan

Halaman admin ada di `/admin`. Alamat itu sengaja tidak disembunyikan —
mengganti alamat bukan pengamanan. Yang melindungi adalah tiga lapis yang
**sudah terpasang**, tanpa layanan tambahan:

1. **Login** — `middleware.ts` memvalidasi sesi ke Supabase di setiap request
   ke `/admin`; yang belum login diarahkan ke `/admin/login`.
2. **Daftar admin** — login saja tidak cukup. Hanya akun yang ada di tabel
   `admins` yang lolos `is_admin()`.
3. **Row Level Security** — ini penjaga yang sebenarnya, di database. Semua
   tabel dan bucket foto hanya bisa **ditulis** oleh admin; publik hanya bisa
   membaca data aktif. Sekalipun halaman admin berhasil ditembus, database
   tetap menolak.

Aplikasi hanya memakai *publishable key* (memang aman terlihat publik). Jangan
pernah menaruh `service_role` key di `.env`, di variabel `NEXT_PUBLIC_*`, atau
di repo ini — kunci itu melewati RLS.

### Checklist sebelum toko dibuka (5 menit, semua di dashboard Supabase)

- [ ] **Matikan pendaftaran publik** — Authentication → Sign In / Providers →
      matikan **Allow new users to sign up**. Ini paling penting: kunci publik
      bisa dipakai siapa saja untuk mendaftar, dan tanpa ini orang asing bisa
      punya akun di proyek Anda. Admin tetap dibuat lewat **Add user**
      (langkah 4 di atas), jadi alur pasang tidak berubah.
- [ ] **Password admin panjang dan unik** — minimal 12 karakter, jangan dipakai
      di layanan lain. Naikkan batas minimumnya di pengaturan Authentication
      (cari *Minimum password length*).
- [ ] **Aktifkan 2FA di akun pemilik** — Supabase, Cloudflare, dan GitHub. Akun
      ini lebih berkuasa daripada `/admin` (bisa mengubah database, kode, dan
      domain), jadi pengamanannya paling berdampak. Gratis dan tanpa kode.
- [ ] **Isi `NEXT_PUBLIC_SITE_URL` dengan domain asli**, dan di Authentication →
      URL Configuration isi *Site URL* yang sama.
- [ ] **Cek tabel `admins`** — hanya berisi orang yang memang boleh mengelola toko:

  ```sql
  select email, created_at from public.admins;
  ```

### Operasional

- **Menambah admin:** buat user di Authentication → Users, lalu jalankan
  `insert into public.admins …` seperti langkah 5. **Mencabut akses:** hapus
  barisnya dari `admins` (aksesnya hilang saat itu juga), lalu hapus user-nya.
- **Lupa password:** Authentication → Users → pilih user → *Send password
  recovery* atau atur ulang langsung. Belum ada fitur lupa password di aplikasi
  (sengaja, supaya pemasangan tetap sederhana).
- **Login dibatasi otomatis** oleh Supabase Auth (rate limit per IP), jadi
  tebak-menebak password tidak bisa berjalan cepat.
- Header dasar (`X-Frame-Options`, `nosniff`, `Referrer-Policy`) sudah dipasang
  di `next.config.ts`. Tidak ada Content-Security-Policy karena Next.js memakai
  skrip inline.
- Dependabot memantau dependensi tiap minggu (`.github/dependabot.yml`).

### Belum ada di versi 1 (sengaja)

Ditunda supaya pemasangan tetap mudah; masuk akal ditambah di versi berikutnya
bila toko sudah ramai:

- Verifikasi dua langkah (MFA/TOTP) untuk admin — didukung Supabase, butuh
  halaman pendaftaran dan pengecekan di aplikasi.
- Batas ukuran/tipe file di sisi server untuk bucket `product-images`
  (sekarang divalidasi di browser; yang bisa mengunggah tetap hanya admin).
- Log aktivitas admin dan fitur lupa password di dalam aplikasi.

## Catatan desain

Gambar di `public/products` adalah ilustrasi SVG buatan sendiri
(`scripts/generate-placeholder-images.mjs`), dipakai sebagai pengganti sementara
sampai foto produk asli diunggah lewat CMS.
