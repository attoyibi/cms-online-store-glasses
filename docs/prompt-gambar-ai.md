# Prompt gambar produk (AI)

Tujuan: mengganti semua gambar SVG di `public/products/` dengan gambar nyata buatan AI.
Total **40 gambar** = 20 produk x 2 gambar. Kategori, hero, dan blok "Tentang" memakai ulang gambar produk ini, jadi tidak perlu gambar tambahan.

## Cara tercepat: pakai CSV

Buka `docs/prompt-gambar-ai.csv` di Excel atau Google Sheets. Ada 40 baris, kolom `prompt` sudah lengkap (prompt dasar + subjek + sudut), jadi tinggal salin satu sel dan tempel ke alat AI. Kolom `nama_file` adalah nama file yang harus dipakai saat menyimpan hasilnya. Bagian di bawah ini hanya penjelasan.

Setiap prompt sudah meminta AI menulis dua keterangan kecil dan tipis di dalam gambar: kode (mis. `P01-1`) di pojok kiri atas dan "Foto contoh" di pojok kanan bawah. **Nama file bebas**, Anda tidak perlu menamai manual: saya membaca kode di pojok gambar untuk tahu itu foto produk yang mana. Kalau AI salah menulis teksnya, saya akan beri tahu dan gambar itu dibuat ulang (atau saya tambahkan keterangannya sendiri).

## Cara pakai

1. Buat gambar dengan prompt di bawah memakai alat AI apa pun.
2. Simpan semua file di **satu folder datar**: `G:\claude code\cms-online-store-glasses\gambar-ai\`
3. Nama file bebas (png/jpg/webp), tidak perlu diubah. Jangan hapus kode kecil di pojok gambar karena itu yang saya baca.
4. Beri tahu saya. Saya akan mengompres ke WebP, memindahkannya ke `public/products/`, dan mengganti semua rujukan di kode, `seed-demo.sql`, dan blok halaman depan.

Aturan: rasio **1:1 (persegi)**, minimal 1200 px, tanpa teks, tanpa logo, tanpa watermark.

## Tips supaya hasilnya konsisten

- Buat gambar `-1` dulu. Kalau alatnya mendukung gambar referensi, pakai `-1` sebagai referensi untuk `-2` dan tambahkan: "same glasses, same colors, different angle".
- Perbesar hasilnya dan periksa engsel, tangkai kiri-kanan, dan lensa. Kalau tidak simetris atau ada logo aneh, generate ulang.
- Jangan sebut merek asli (Ray-Ban, Oakley, dll.) di prompt.
- Kalau hasilnya terlalu mengilap atau terlalu dramatis, tambahkan: "natural, realistic, not CGI, not 3D render".

## Prompt dasar (tempel di awal SEMUA prompt)

```
Professional e-commerce product photo, single object centered, pure white seamless background, soft diffused studio lighting with gentle natural shadow beneath, sharp focus, high detail, realistic materials, square composition, no logo, no brand name, no watermark, no people.
```

(Untuk kemudahan, gunakan CSV: di sana prompt dasar, subjek, sudut, dan instruksi keterangan pojok sudah digabung per gambar.)

## Format tiap gambar

- Gambar 1: `[PROMPT DASAR] [SUBJEK], straight front view, perfectly symmetrical.`
- Gambar 2: `[PROMPT DASAR] [SUBJEK], three-quarter angle view showing the temple arm and hinge detail.`

Ganti `[SUBJEK]` dengan baris di bawah.

## Kacamata (15 produk)

| Slug (nama file) | SUBJEK |
|---|---|
| `arka-square-matte-black` | a pair of eyeglasses, square frame with softly rounded corners, matte black acetate, clear prescription lenses, medium size |
| `nadira-cateye-rose` | a pair of eyeglasses, cat-eye frame with upswept outer corners, translucent dusty rose pink acetate, clear lenses |
| `kavi-round-titanium` | a pair of eyeglasses, thin round wire frame, black titanium, very lightweight look, clear lenses, nose pads |
| `solano-aviator-gold` | a pair of aviator sunglasses, thin gold stainless steel frame, double bridge, dark gradient green-grey lenses |
| `brio-browline-jade` | a pair of eyeglasses, browline style, thick jade green acetate top brow with thin metal lower rim, clear lenses |
| `mira-rectangle-slate` | a pair of eyeglasses, slim rectangular frame, slate grey TR90 plastic, lightweight, clear lenses |
| `pixel-kids-flex-round` | a pair of children's eyeglasses, round flexible frame, warm brown TR90 plastic, slightly rounded soft edges, clear lenses, small size |
| `vesta-square-amber` | a pair of eyeglasses, square frame, translucent amber tortoiseshell-like honey acetate, clear lenses |
| `noir-cateye-sunglasses` | a pair of cat-eye sunglasses, chocolate brown acetate frame, dark brown tinted lenses |
| `atlas-titanium-browline` | a pair of premium eyeglasses, browline style, brushed grey titanium frame, thin elegant, clear lenses |
| `orion-rectangle-jade` | a pair of eyeglasses, rectangular acetate frame, deep jade green, clear lenses |
| `juno-kids-square` | a pair of children's eyeglasses, square frame, amber orange TR90 plastic, soft rounded edges, clear lenses, small size |
| `dune-aviator-ink` | a pair of aviator sunglasses, matte black stainless steel frame, dark grey lenses |
| `sena-round-sand` | a pair of eyeglasses, round frame, sandy light brown acetate front with thin metal temples, clear lenses |
| `helio-premium-acetate` | a pair of premium eyeglasses, square thick frame, glossy black Japanese acetate, subtle metal hinge detail, clear lenses |

## Lensa (3 produk)

Untuk lensa, ganti format gambar 1 dan 2 dengan:

| Slug | Gambar 1 | Gambar 2 |
|---|---|---|
| `lensa-blue-light-single-vision` | a pair of clear round eyeglass lenses lying on white surface, faint blue-violet reflection from the anti-blue-light coating | close-up of one lens edge and its coating reflection, shallow depth of field |
| `lensa-progresif-premium` | a pair of clear eyeglass lenses on white surface, subtle smooth gradient reflections, premium look | one lens held at an angle showing the polished edge and soft reflections |
| `lensa-photochromic-transitions` | two pairs of lenses side by side: one clear, one tinted grey, showing the photochromic effect | one clear lens and one grey tinted lens overlapping slightly, soft lighting |

Tetap awali dengan prompt dasar.

## Lap kacamata (2 produk)

| Slug | Gambar 1 | Gambar 2 |
|---|---|---|
| `lap-microfiber-serat-halus` | a single folded square microfiber lens cleaning cloth, jade green, soft fine texture, small size, on white | the cloth lying flat and slightly crumpled showing the fine fiber texture, close-up |
| `lap-microfiber-set-3` | a neat stack of three folded microfiber lens cleaning cloths in jade green, sand beige, and slate grey | the three cloths fanned out side by side on white |

Tetap awali dengan prompt dasar.

## Daftar file yang saya harapkan (40)

Untuk setiap slug di tiga tabel di atas (15 kacamata + 3 lensa + 2 lap = 20 slug): `<slug>-1` dan `<slug>-2`.

## Keterangan di situs

Setelah gambar terpasang, saya akan tambahkan satu baris keterangan di footer: "Foto produk pada situs ini dibuat dengan AI dan hanya sebagai contoh." Beri tahu saya kalau mau redaksi lain.
