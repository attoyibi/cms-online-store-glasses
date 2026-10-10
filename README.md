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
- Checkout → menyusun rincian pesanan menjadi pesan WhatsApp

**Untuk admin (perlu login)**

- Ringkasan: jumlah produk, kategori, dan daftar stok menipis
- CRUD produk — termasuk unggah gambar ke Supabase Storage, harga coret, spesifikasi bebas, dan varian
- CRUD kategori dengan pengaturan urutan tampil
- Kelola opsi filter (bentuk, material, warna) tanpa perlu menyentuh SQL
- Pengaturan toko: nama, nomor WhatsApp, alamat, jam buka, dan bar pengumuman

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
2. SQL Editor → jalankan `supabase/v3/01_schema.sql`, lalu
   `supabase/v3/02_seed.sql` (opsional — isinya data contoh). Dua file itu
   sudah mencakup semuanya; detail dan riwayat versinya ada di
   [`supabase/README.md`](supabase/README.md). Untuk **varian produk** dan
   kategori Lap Kacamata, lanjutkan dengan `supabase/v4/01_variants.sql`
   (dan `02_seed_lap_lensa.sql` bila ingin data contoh).
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
├─ README.md             Panduan setup & aturan versi
├─ v1/ + v2/              Riwayat — jangan diubah lagi
└─ v3/                   Setup baru mulai dari sini (01_schema + 02_seed)
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

## Catatan desain

Gambar di `public/products` adalah ilustrasi SVG buatan sendiri
(`scripts/generate-placeholder-images.mjs`), dipakai sebagai pengganti sementara
sampai foto produk asli diunggah lewat CMS.
