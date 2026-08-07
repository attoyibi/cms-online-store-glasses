# CMS Online Store Glasses

Toko kacamata online dengan CMS. Pengunjung memilih produk lalu mengirim pesanannya
lewat WhatsApp — **tidak ada pembayaran di dalam situs**. Admin mengelola katalog
lewat halaman `/admin` yang dilindungi login.

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
- Katalog dengan pencarian dan pengurutan (state ada di URL, bisa dibagikan)
- Halaman kategori dan detail produk lengkap dengan spesifikasi
- Keranjang yang bertahan di `localStorage` dan sinkron antar tab
- Checkout → menyusun rincian pesanan menjadi pesan WhatsApp

**Untuk admin (perlu login)**

- Ringkasan: jumlah produk, kategori, dan daftar stok menipis
- CRUD produk — termasuk unggah gambar ke Supabase Storage, harga coret, dan spesifikasi bebas
- CRUD kategori dengan pengaturan urutan tampil
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
2. SQL Editor → jalankan isi `supabase/v1/` berurutan: `01_schema` → `02_rls` →
   `03_storage` → `04_seed` (yang terakhir opsional, isinya data contoh).
3. Salin `.env.example` menjadi `.env.local`, isi `NEXT_PUBLIC_SUPABASE_URL` dan
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Project Settings → API).
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

```bash
npx wrangler login
npm run deploy
```

Sebelum deploy pertama, set variabel di Cloudflare Dashboard →
Workers & Pages → project → Settings → Variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `NEXT_PUBLIC_SITE_URL`

> **Catatan macOS:** `npm run preview` dan `npm run cf-typegen` menjalankan `workerd`
> secara lokal, yang butuh **macOS 13.5+**. `npm run deploy` tidak terpengaruh karena
> proses build-nya berjalan di Node, bukan di workerd.

## Perintah

| Perintah             | Kegunaan                                          |
| -------------------- | ------------------------------------------------- |
| `npm run dev`        | Server pengembangan                               |
| `npm run build`      | Build produksi                                    |
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
│  ├─ catalog/           Toolbar, filter kategori, grid produk
│  ├─ layout/            Header, footer, tombol WhatsApp mengambang
│  ├─ product/           Kartu produk, galeri, tombol tambah
│  ├─ sections/          Section landing page
│  └─ ui/                Komponen shadcn/ui
├─ lib/
│  ├─ data/              Query Supabase + data contoh
│  ├─ supabase/          Client browser/server, guard admin, middleware
│  ├─ cart-store.ts      External store keranjang (localStorage)
│  ├─ whatsapp.ts        Penyusun pesan & tautan wa.me
│  └─ site-config.ts     Identitas toko (default)
└─ middleware.ts         Penyegar sesi + penjaga rute /admin

supabase/
├─ README.md             Panduan setup & aturan versi
└─ v1/                   Migrasi versi 1 (01_schema → 04_seed)
```

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
