import type { Field } from "@/lib/blocks/schema";
import type { Block, BlockPropsMap, BlockType } from "@/lib/blocks/types";

/**
 * Daftar semua jenis blok: nama untuk admin, kolom yang bisa diedit, dan
 * isi bawaan. Isi bawaan SENGAJA persis sama dengan teks yang dulu tertanam
 * di komponen — halaman depan harus tampil identik sebelum diedit siapa pun.
 */

type BlockDefinition<K extends BlockType> = {
  label: string;
  description: string;
  fields: Field[];
  defaults: BlockPropsMap[K];
};

const eyebrow: Field = { kind: "text", name: "eyebrow", label: "Label kecil di atas judul", max: 60 };

export const BLOCK_DEFS: { [K in BlockType]: BlockDefinition<K> } = {
  hero: {
    label: "Hero (bagian atas)",
    description: "Judul besar, tombol, angka ringkas, dan susunan gambar.",
    fields: [
      eyebrow,
      { kind: "text", name: "titleLine1", label: "Judul — baris 1", max: 80 },
      { kind: "text", name: "titleHighlight", label: "Judul — baris 2 (berwarna)", max: 80 },
      { kind: "textarea", name: "description", label: "Deskripsi", max: 500, rows: 4 },
      { kind: "text", name: "primaryLabel", label: "Tombol utama — teks", max: 40 },
      { kind: "link", name: "primaryHref", label: "Tombol utama — tujuan" },
      { kind: "text", name: "whatsappLabel", label: "Tombol WhatsApp — teks", max: 40 },
      {
        kind: "textarea",
        name: "whatsappMessage",
        label: "Tombol WhatsApp — isi pesan",
        max: 300,
        rows: 2,
        help: "Tulis {store} untuk nama toko.",
      },
      {
        kind: "list",
        name: "stats",
        label: "Angka ringkas",
        itemLabel: "Angka",
        max: 3,
        blank: { value: "", label: "" },
        fields: [
          { kind: "text", name: "value", label: "Angka", max: 12 },
          { kind: "text", name: "label", label: "Keterangan", max: 50 },
        ],
      },
      { kind: "image", name: "imageA", label: "Gambar besar kiri" },
      { kind: "text", name: "imageAAlt", label: "Deskripsi gambar kiri", max: 120 },
      { kind: "image", name: "imageB", label: "Gambar besar kanan" },
      { kind: "text", name: "imageBAlt", label: "Deskripsi gambar kanan", max: 120 },
      { kind: "image", name: "imageC", label: "Gambar kartu kecil" },
      { kind: "text", name: "imageCAlt", label: "Deskripsi gambar kartu", max: 120 },
      { kind: "text", name: "cardTitle", label: "Kartu kecil — judul", max: 60 },
      { kind: "text", name: "cardSubtitle", label: "Kartu kecil — keterangan", max: 60 },
    ],
    defaults: {
      eyebrow: "Konsultasi gratis sebelum beli",
      titleLine1: "Kacamata yang pas,",
      titleHighlight: "tanpa harus menebak.",
      description:
        "Ratusan frame, sunglasses, dan lensa pilihan dengan harga yang transparan. Ceritakan kebutuhan mata Anda lewat WhatsApp, kami bantu carikan yang cocok — lalu kami kirim ke seluruh Indonesia.",
      primaryLabel: "Lihat Koleksi",
      primaryHref: "/produk",
      whatsappLabel: "Konsultasi WhatsApp",
      whatsappMessage: "Halo {store}, saya mau konsultasi soal kacamata.",
      stats: [
        { value: "2", label: "Toko di Yogyakarta" },
        { value: "500+", label: "Model frame & lensa" },
        { value: "34", label: "Provinsi terjangkau" },
      ],
      imageA: "/products/browline-jade.svg",
      imageAAlt: "Frame browline warna jade",
      imageB: "/products/cateye-rose.svg",
      imageBAlt: "Frame cat-eye warna rose",
      imageC: "/products/aviator-ink.svg",
      imageCAlt: "Sunglasses aviator hitam",
      cardTitle: "Solano Aviator",
      cardSubtitle: "Polarized UV400",
    },
  },

  "trust-bar": {
    label: "Bar keunggulan",
    description: "Deretan butir keunggulan toko dengan ikon, di atas latar gelap.",
    fields: [
      {
        kind: "list",
        name: "items",
        label: "Butir keunggulan",
        itemLabel: "Butir",
        max: 6,
        blank: { icon: "star", title: "", body: "" },
        fields: [
          { kind: "icon", name: "icon", label: "Ikon" },
          { kind: "text", name: "title", label: "Judul", max: 60 },
          { kind: "textarea", name: "body", label: "Keterangan", max: 200, rows: 2 },
        ],
      },
    ],
    defaults: {
      items: [
        {
          icon: "store",
          title: "Toko fisik di Jogja",
          body: "Bisa datang langsung untuk coba frame dan cek mata.",
        },
        {
          icon: "package-check",
          title: "Kirim ke seluruh Indonesia",
          body: "Dikemas rapi, dilengkapi hard case dan lap microfiber.",
        },
        {
          icon: "shield-check",
          title: "Garansi 1 tahun",
          body: "Berlaku untuk kerusakan frame dan lapisan lensa.",
        },
        {
          icon: "headphones",
          title: "Dibantu sampai cocok",
          body: "Tanya apa saja lewat WhatsApp, dijawab orang asli.",
        },
      ],
    },
  },

  "category-grid": {
    label: "Daftar kategori",
    description: "Kartu kategori. Isinya otomatis dari menu Kategori; di sini hanya judulnya.",
    fields: [
      eyebrow,
      { kind: "text", name: "title", label: "Judul", max: 120 },
      { kind: "textarea", name: "description", label: "Deskripsi", max: 300, rows: 2 },
      { kind: "text", name: "actionLabel", label: "Tautan kanan — teks", max: 40, help: "Kosongkan untuk menyembunyikan." },
      { kind: "link", name: "actionHref", label: "Tautan kanan — tujuan" },
    ],
    defaults: {
      eyebrow: "Kategori",
      title: "Mulai dari kebutuhan Anda",
      description:
        "Pilih dulu jenisnya, nanti kami bantu persempit ke bentuk dan ukuran yang paling pas.",
      actionLabel: "Semua produk",
      actionHref: "/produk",
    },
  },

  "product-showcase": {
    label: "Deretan produk",
    description: "Produk unggulan, terbaru, atau dari satu kategori. Produknya otomatis dari katalog.",
    fields: [
      eyebrow,
      { kind: "text", name: "title", label: "Judul", max: 120 },
      { kind: "textarea", name: "description", label: "Deskripsi", max: 300, rows: 2 },
      { kind: "text", name: "actionLabel", label: "Tautan kanan — teks", max: 40, help: "Kosongkan untuk menyembunyikan." },
      { kind: "link", name: "actionHref", label: "Tautan kanan — tujuan" },
      {
        kind: "select",
        name: "source",
        label: "Produk yang ditampilkan",
        options: [
          { value: "unggulan", label: "Produk unggulan (ditandai di CMS)" },
          { value: "terbaru", label: "Produk terbaru" },
          { value: "kategori", label: "Dari satu kategori" },
        ],
      },
      {
        kind: "text",
        name: "categorySlug",
        label: "Slug kategori",
        max: 60,
        help: "Hanya dipakai bila memilih 'Dari satu kategori'. Contoh: lap-kacamata",
      },
      { kind: "number", name: "limit", label: "Jumlah produk", min: 1, max: 10 },
      {
        kind: "select",
        name: "background",
        label: "Latar",
        options: [
          { value: "polos", label: "Polos" },
          { value: "lembut", label: "Lembut (sedikit berwarna)" },
        ],
      },
    ],
    defaults: {
      eyebrow: "Paling Dicari",
      title: "Best seller bulan ini",
      description: "Model yang paling sering dipesan dan paling jarang dikembalikan.",
      actionLabel: "Lihat semua",
      actionHref: "/produk",
      source: "unggulan",
      categorySlug: "",
      limit: 5,
      background: "polos",
    },
  },

  about: {
    label: "Tentang kami",
    description: "Cerita singkat toko dengan gambar, butir poin, dan tombol WhatsApp.",
    fields: [
      eyebrow,
      { kind: "text", name: "title", label: "Judul", max: 160 },
      { kind: "textarea", name: "body", label: "Isi", max: 800, rows: 5 },
      { kind: "strings", name: "points", label: "Butir poin", itemLabel: "Poin", max: 6 },
      { kind: "image", name: "image", label: "Gambar" },
      { kind: "text", name: "imageAlt", label: "Deskripsi gambar", max: 120 },
      {
        kind: "select",
        name: "imagePosition",
        label: "Posisi gambar (layar lebar)",
        options: [
          { value: "kiri", label: "Kiri" },
          { value: "kanan", label: "Kanan" },
        ],
      },
      { kind: "text", name: "ctaLabel", label: "Tombol WhatsApp — teks", max: 40 },
      { kind: "textarea", name: "ctaMessage", label: "Tombol WhatsApp — isi pesan", max: 300, rows: 2, help: "Tulis {store} untuk nama toko." },
    ],
    defaults: {
      eyebrow: "Tentang Kami",
      title: "Optik kecil dari Jogja yang tidak suka menjual barang asal-asalan",
      body: "Kami mulai dari satu gerai kecil di Kaliurang. Sampai sekarang prinsipnya tidak berubah: setiap frame dicoba dulu sebelum masuk katalog, dan setiap pertanyaan dijawab apa adanya — termasuk kalau jawabannya adalah “model ini kurang cocok untuk wajah Anda”.",
      points: [
        "Frame diseleksi langsung, bukan dropship",
        "Resep lensa bisa dikirim dari hasil periksa optik mana pun",
        "Pemasangan lensa dikerjakan di lab sendiri",
      ],
      image: "/products/round-sand.svg",
      imageAlt: "Frame bundar warna pasir",
      imagePosition: "kiri",
      ctaLabel: "Konsultasi Sekarang",
      ctaMessage: "Halo {store}, saya mau konsultasi soal pilihan frame.",
    },
  },

  lens: {
    label: "Lensa",
    description: "Penjelasan jenis lensa di kiri dan beberapa produk lensa di kanan.",
    fields: [
      eyebrow,
      { kind: "text", name: "title", label: "Judul", max: 160 },
      { kind: "textarea", name: "body", label: "Isi", max: 800, rows: 4 },
      {
        kind: "list",
        name: "types",
        label: "Jenis lensa",
        itemLabel: "Jenis",
        max: 8,
        blank: { name: "", body: "" },
        fields: [
          { kind: "text", name: "name", label: "Nama", max: 60 },
          { kind: "textarea", name: "body", label: "Keterangan", max: 200, rows: 2 },
        ],
      },
      { kind: "text", name: "ctaLabel", label: "Tombol WhatsApp — teks", max: 40 },
      { kind: "textarea", name: "ctaMessage", label: "Tombol WhatsApp — isi pesan", max: 300, rows: 2, help: "Tulis {store} untuk nama toko." },
      { kind: "text", name: "linkLabel", label: "Tautan — teks", max: 40 },
      { kind: "link", name: "linkHref", label: "Tautan — tujuan" },
      { kind: "text", name: "categorySlug", label: "Slug kategori produk", max: 60, help: "Produk yang tampil di kanan diambil dari kategori ini." },
      { kind: "number", name: "limit", label: "Jumlah produk", min: 0, max: 6 },
    ],
    defaults: {
      eyebrow: "Lensa",
      title: "Frame-nya bagus, lensanya jangan asal",
      body: "Lensa menentukan nyaman atau tidaknya kacamata dipakai seharian. Kirimkan hasil periksa mata Anda, kami bantu pilihkan tipe dan indeks yang sesuai — termasuk memberi tahu kalau yang lebih murah sudah cukup.",
      types: [
        {
          name: "Single Vision",
          body: "Satu titik fokus. Untuk minus, plus, atau silinder biasa.",
        },
        {
          name: "Progresif",
          body: "Jauh, menengah, dan baca dalam satu lensa tanpa garis.",
        },
        {
          name: "Blue Light",
          body: "Menyaring cahaya biru layar. Cocok untuk kerja depan komputer.",
        },
        {
          name: "Photochromic",
          body: "Menggelap sendiri di luar ruangan, bening lagi di dalam.",
        },
      ],
      ctaLabel: "Kirim Resep Lensa",
      ctaMessage: "Halo {store}, saya mau tanya soal lensa. Ini hasil periksa mata saya:",
      linkLabel: "Lihat semua lensa",
      linkHref: "/kategori/lensa",
      categorySlug: "lensa",
      limit: 3,
    },
  },

  "how-to-order": {
    label: "Cara pesan",
    description: "Langkah-langkah memesan dengan ikon.",
    fields: [
      eyebrow,
      { kind: "text", name: "title", label: "Judul", max: 120 },
      { kind: "textarea", name: "description", label: "Deskripsi", max: 300, rows: 2 },
      {
        kind: "list",
        name: "steps",
        label: "Langkah",
        itemLabel: "Langkah",
        max: 6,
        blank: { icon: "star", title: "", body: "" },
        fields: [
          { kind: "icon", name: "icon", label: "Ikon" },
          { kind: "text", name: "title", label: "Judul", max: 60 },
          { kind: "textarea", name: "body", label: "Keterangan", max: 250, rows: 2 },
        ],
      },
    ],
    defaults: {
      eyebrow: "Cara Pesan",
      title: "Empat langkah, tidak perlu buat akun",
      description:
        "Situs ini tidak memproses pembayaran. Semua transaksi diselesaikan lewat WhatsApp supaya Anda bisa bertanya dulu sebelum membayar.",
      steps: [
        {
          icon: "shopping-bag",
          title: "Pilih produk",
          body: "Masukkan frame atau lensa yang Anda suka ke keranjang. Boleh lebih dari satu.",
        },
        {
          icon: "message-circle",
          title: "Kirim ke WhatsApp",
          body: "Tekan Lanjut Pesan. Rincian pesanan dan total harga otomatis tersusun jadi pesan.",
        },
        {
          icon: "wallet",
          title: "Konfirmasi & bayar",
          body: "Kami balas dengan ongkir dan cara pembayaran. Pembayaran dilakukan di luar situs ini.",
        },
        {
          icon: "package-check",
          title: "Dikirim",
          body: "Pesanan diproses hari itu juga bila stok tersedia, lalu nomor resi kami kirimkan.",
        },
      ],
    },
  },

  testimonials: {
    label: "Testimoni",
    description: "Kartu ulasan pelanggan dengan bintang lima.",
    fields: [
      eyebrow,
      { kind: "text", name: "title", label: "Judul", max: 120 },
      {
        kind: "list",
        name: "reviews",
        label: "Ulasan",
        itemLabel: "Ulasan",
        max: 6,
        blank: { name: "", city: "", body: "" },
        fields: [
          { kind: "text", name: "name", label: "Nama", max: 60 },
          { kind: "text", name: "city", label: "Kota", max: 60 },
          { kind: "textarea", name: "body", label: "Isi ulasan", max: 500, rows: 4 },
        ],
      },
    ],
    defaults: {
      eyebrow: "Testimoni",
      title: "Yang dikatakan pelanggan",
      reviews: [
        {
          name: "Rani P.",
          city: "Bantul",
          body: "Awalnya ragu beli kacamata online. Ternyata dibantu sampai detail — dikasih tahu frame yang saya incar terlalu lebar untuk wajah saya, lalu direkomendasikan yang lain. Pas banget.",
        },
        {
          name: "Bagas W.",
          city: "Surabaya",
          body: "Pesan Jumat sore, Senin sudah sampai. Lensa progresifnya nyaman, dan sempat ditanya ulang soal ukuran karena ada angka yang aneh di resep saya. Teliti.",
        },
        {
          name: "Siti H.",
          city: "Makassar",
          body: "Harga di website sama dengan yang dikonfirmasi di WhatsApp, tidak ada biaya tambahan mendadak. Kemasannya juga rapi, dapat hard case dan lap.",
        },
      ],
    },
  },

  faq: {
    label: "Pertanyaan umum (FAQ)",
    description: "Daftar pertanyaan yang bisa dibuka-tutup, dengan tombol WhatsApp.",
    fields: [
      eyebrow,
      { kind: "text", name: "title", label: "Judul", max: 120 },
      { kind: "textarea", name: "description", label: "Deskripsi", max: 300, rows: 2 },
      { kind: "text", name: "ctaLabel", label: "Tombol WhatsApp — teks", max: 40 },
      { kind: "textarea", name: "ctaMessage", label: "Tombol WhatsApp — isi pesan", max: 300, rows: 2, help: "Tulis {store} untuk nama toko." },
      {
        kind: "list",
        name: "items",
        label: "Pertanyaan",
        itemLabel: "Pertanyaan",
        max: 15,
        blank: { q: "", a: "" },
        fields: [
          { kind: "text", name: "q", label: "Pertanyaan", max: 160 },
          { kind: "textarea", name: "a", label: "Jawaban", max: 800, rows: 4 },
        ],
      },
    ],
    defaults: {
      eyebrow: "Pertanyaan Umum",
      title: "Hal yang paling sering ditanyakan",
      description:
        "Tidak ketemu jawabannya? Tanya langsung, dijawab orang asli — bukan bot.",
      ctaLabel: "Tanya Lewat WhatsApp",
      ctaMessage: "Halo {store}, saya mau bertanya:",
      items: [
        {
          q: "Apakah bisa bayar lewat website ini?",
          a: "Tidak. Website ini hanya untuk memilih produk. Setelah menekan Lanjut Pesan, rincian pesanan dikirim ke WhatsApp kami, lalu pembayaran diatur di sana — transfer bank, e-wallet, atau bayar di toko.",
        },
        {
          q: "Saya tidak punya hasil periksa mata, bagaimana?",
          a: "Bisa datang ke toko kami di Jogja untuk periksa gratis. Kalau di luar kota, Anda bisa periksa di optik terdekat lalu kirimkan fotonya ke WhatsApp kami — kami hanya butuh angka SPH, CYL, AXIS, dan PD.",
        },
        {
          q: "Berapa lama pesanan sampai?",
          a: "Frame tanpa lensa resep biasanya dikirim di hari yang sama. Kalau pakai lensa resep, pengerjaan 2–4 hari kerja tergantung tipe lensanya, baru dikirim.",
        },
        {
          q: "Kalau ukurannya tidak cocok, bisa tukar?",
          a: "Frame bisa ditukar dalam 7 hari selama belum dipasangi lensa resep dan kondisinya masih seperti semula. Lensa resep tidak bisa ditukar karena dibuat khusus, tapi kalau ada kesalahan dari kami, kami ganti tanpa biaya.",
        },
        {
          q: "Apakah ada garansi?",
          a: "Ada, 1 tahun untuk kerusakan frame karena cacat produksi dan pengelupasan lapisan lensa. Tidak termasuk lensa pecah, tergores karena pemakaian, atau frame patah karena terjatuh.",
        },
      ],
    },
  },

  cta: {
    label: "Ajakan bertindak (banner)",
    description: "Banner gelap dengan judul, teks, dan dua tombol.",
    fields: [
      { kind: "text", name: "title", label: "Judul", max: 120 },
      { kind: "textarea", name: "body", label: "Isi", max: 400, rows: 3 },
      { kind: "text", name: "primaryLabel", label: "Tombol WhatsApp — teks", max: 40 },
      { kind: "textarea", name: "primaryMessage", label: "Tombol WhatsApp — isi pesan", max: 300, rows: 2, help: "Tulis {store} untuk nama toko." },
      { kind: "text", name: "secondaryLabel", label: "Tombol kedua — teks", max: 40 },
      { kind: "link", name: "secondaryHref", label: "Tombol kedua — tujuan" },
    ],
    defaults: {
      title: "Belum yakin mau yang mana?",
      body: "Kirim foto wajah Anda dan hasil periksa mata. Dalam beberapa menit kami balas dengan dua sampai tiga rekomendasi beserta alasannya.",
      primaryLabel: "Minta Rekomendasi",
      primaryMessage:
        "Halo {store}, tolong bantu carikan kacamata yang cocok untuk saya.",
      secondaryLabel: "Jelajahi Katalog",
      secondaryHref: "/produk",
    },
  },
};

export const BLOCK_TYPES = Object.keys(BLOCK_DEFS) as BlockType[];

/** Salinan baru isi bawaan satu jenis blok (aman diubah tanpa merusak bawaan) */
export function defaultPropsOf<K extends BlockType>(type: K): BlockPropsMap[K] {
  return structuredClone(BLOCK_DEFS[type].defaults);
}

/**
 * Gabungkan props yang diberikan dengan isi bawaan. Dipakai komponen section
 * supaya tetap bisa dipasang tanpa props (mis. di halaman Tentang dan Cara
 * Pesan) dan tampil persis seperti semula.
 */
export function withDefaults<K extends BlockType>(
  type: K,
  props?: Partial<BlockPropsMap[K]>,
): BlockPropsMap[K] {
  return { ...defaultPropsOf(type), ...props };
}

/**
 * Susunan halaman depan sebelum pernah diedit — urutan dan isinya sama
 * persis dengan halaman yang dulu ditulis langsung di kode.
 */
export function defaultHomeBlocks(): Block[] {
  const showcaseDefaults = defaultPropsOf("product-showcase");
  return [
    { id: "hero", type: "hero", hidden: false, props: defaultPropsOf("hero") },
    { id: "keunggulan", type: "trust-bar", hidden: false, props: defaultPropsOf("trust-bar") },
    { id: "kategori", type: "category-grid", hidden: false, props: defaultPropsOf("category-grid") },
    { id: "best-seller", type: "product-showcase", hidden: false, props: showcaseDefaults },
    { id: "tentang", type: "about", hidden: false, props: defaultPropsOf("about") },
    {
      id: "terbaru",
      type: "product-showcase",
      hidden: false,
      props: {
        ...defaultPropsOf("product-showcase"),
        eyebrow: "Baru Datang",
        title: "Koleksi terbaru",
        description: "Baru masuk katalog dalam beberapa minggu terakhir.",
        actionHref: "/produk?sort=terbaru",
        source: "terbaru",
        background: "lembut",
      },
    },
    { id: "lensa", type: "lens", hidden: false, props: defaultPropsOf("lens") },
    { id: "cara-pesan", type: "how-to-order", hidden: false, props: defaultPropsOf("how-to-order") },
    { id: "testimoni", type: "testimonials", hidden: false, props: defaultPropsOf("testimonials") },
    { id: "faq", type: "faq", hidden: false, props: defaultPropsOf("faq") },
    { id: "ajakan", type: "cta", hidden: false, props: defaultPropsOf("cta") },
  ];
}
