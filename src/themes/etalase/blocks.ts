import { defaultPropsOf } from "@/lib/blocks/registry";
import type { Block } from "@/lib/blocks/types";

/**
 * Susunan halaman depan bawaan tema Etalase. Memakai jenis blok yang sama
 * dengan tema klasik; yang berbeda adalah urutan, teks, dan cara tampilnya
 * (lihat `themes/views.tsx`). Semua teks bisa diedit di Admin → Halaman Depan.
 */
export function etalaseBlocks(): Block[] {
  const showcase = defaultPropsOf("product-showcase");

  return [
    {
      id: "hero",
      type: "hero",
      hidden: false,
      props: {
        ...defaultPropsOf("hero"),
        eyebrow: "Toko kacamata {kota}",
        titleLine1: "Kacamata lengkap dari {kota},",
        titleHighlight: "kirim ke seluruh Indonesia.",
        description:
          "Pilih frame pria, wanita, anak, sunglasses, hingga lensa minus, silinder, dan anti radiasi. Beli langsung di toko atau pesan online lewat WhatsApp.",
        primaryLabel: "Lihat Katalog",
        primaryHref: "/produk",
        whatsappLabel: "Konsultasi via WhatsApp",
        whatsappMessage: "Halo {store}, saya mau tanya stok dan harga kacamata.",
        stats: [
          { value: "Toko fisik", label: "Datang langsung ke {kota}" },
          { value: "Konsultasi", label: "Dibantu memilih lensa" },
          { value: "Lengkap", label: "Frame, sunglasses, lensa" },
        ],
      },
    },
    {
      id: "keunggulan",
      type: "trust-bar",
      hidden: false,
      props: {
        items: [
          {
            icon: "store",
            title: "Toko di {kota}",
            body: "Datang langsung untuk mencoba frame dan konsultasi kebutuhan kacamata Anda.",
          },
          {
            icon: "package-check",
            title: "Kirim seluruh Indonesia",
            body: "Pesan lewat WhatsApp, dikemas rapi dan dikirim ke kota Anda.",
          },
          {
            icon: "glasses",
            title: "Koleksi lengkap",
            body: "Frame, sunglasses, dan berbagai pilihan lensa sesuai kebutuhan.",
          },
          {
            icon: "message-circle",
            title: "Konsultasi via WhatsApp",
            body: "Tanya stok, harga, dan rekomendasi sebelum membeli.",
          },
        ],
      },
    },
    {
      id: "tentang",
      type: "about",
      hidden: false,
      props: {
        ...defaultPropsOf("about"),
        eyebrow: "{toko}",
        title: "Toko kacamata lengkap di {kota}",
        body: "Kami membantu Anda menemukan kacamata yang nyaman, sesuai kebutuhan mata, dan tetap bergaya. Datang langsung ke toko untuk mencoba frame, atau pesan online dan kami kirim ke alamat Anda.",
        points: [],
        image: "",
        imageAlt: "",
        ctaLabel: "Konsultasi Kacamata Sekarang",
        ctaMessage: "Halo {store}, saya mau konsultasi soal kacamata.",
      },
    },
    {
      id: "kategori",
      type: "category-grid",
      hidden: false,
      props: {
        ...defaultPropsOf("category-grid"),
        eyebrow: "",
        title: "Pilih kategori kacamata yang Anda cari",
        description:
          "Cari produk berdasarkan kebutuhan Anda, mulai dari frame harian sampai lensa khusus.",
        actionLabel: "",
        actionHref: "",
      },
    },
    {
      id: "best-seller",
      type: "product-showcase",
      hidden: false,
      props: {
        ...showcase,
        eyebrow: "",
        title: "Produk best seller {toko}",
        description:
          "Pilih yang sesuai gaya Anda, lalu tanyakan stok dan estimasi pengiriman lewat WhatsApp.",
        actionLabel: "Lihat semua produk",
        actionHref: "/produk",
        source: "unggulan",
        limit: 6,
      },
    },
    {
      id: "terbaru",
      type: "product-showcase",
      hidden: false,
      props: {
        ...showcase,
        eyebrow: "",
        title: "Produk terbaru",
        description: "Baru masuk katalog, bisa dilihat langsung di toko atau dipesan online.",
        actionLabel: "Cek produk terbaru",
        actionHref: "/produk?sort=terbaru",
        source: "terbaru",
        limit: 6,
        background: "lembut",
      },
    },
    {
      id: "lensa",
      type: "product-showcase",
      hidden: false,
      props: {
        ...showcase,
        eyebrow: "",
        title: "Lensa sesuai kebutuhan mata Anda",
        description:
          "Pilihan lensa minus, plus, silinder, anti radiasi, dan photochromic. Sudah punya ukuran lensa? Konsultasikan lewat WhatsApp.",
        actionLabel: "Lihat semua lensa",
        actionHref: "/kategori/lensa",
        source: "kategori",
        categorySlug: "lensa",
        limit: 6,
      },
    },
    {
      id: "konsultasi-lensa",
      type: "about",
      hidden: false,
      props: {
        ...defaultPropsOf("about"),
        eyebrow: "Konsultasi lensa",
        title: "Bingung memilih lensa? Kami bantu",
        body: "Bawa resep Anda atau ceritakan keluhan mata lewat WhatsApp. Kami bantu memilih lensa yang cocok untuk aktivitas harian Anda.",
        points: [
          "Resep lensa bisa dikirim lewat WhatsApp",
          "Pilihan lensa minus, plus, silinder, dan anti radiasi",
          "Dibantu memilih sesuai aktivitas harian",
          "Pemasangan lensa dikerjakan di toko",
        ],
        image: "/products/lens-jade.svg",
        imageAlt: "Lensa kacamata",
        imagePosition: "kanan",
        ctaLabel: "Tanya Soal Lensa",
        ctaMessage: "Halo {store}, saya mau konsultasi soal lensa kacamata.",
      },
    },
    {
      id: "kenapa-memilih",
      type: "how-to-order",
      hidden: false,
      props: {
        eyebrow: "",
        title: "Kenapa memilih {toko}?",
        description:
          "Kami membantu Anda membeli kacamata dengan lebih mudah, jelas, dan nyaman, baik datang langsung maupun pesan online.",
        steps: [
          { icon: "glasses", title: "Pilihan produk lengkap", body: "Frame, sunglasses, dan berbagai lensa untuk kebutuhan harian." },
          { icon: "store", title: "Bisa datang ke toko", body: "Coba frame langsung dan konsultasi kebutuhan lensa." },
          { icon: "message-circle", title: "Konsultasi via WhatsApp", body: "Tanya stok, harga, ukuran, dan estimasi pengiriman." },
          { icon: "eye", title: "Dibantu memilih lensa", body: "Sesuaikan lensa dengan resep dan aktivitas Anda." },
          { icon: "package-check", title: "Kirim seluruh Indonesia", body: "Pelanggan luar kota tetap bisa pesan online." },
          { icon: "heart", title: "Sesuai kebutuhan Anda", body: "Untuk pelajar, pekerja, keluarga, hingga gaya harian." },
        ],
      },
    },
    {
      id: "ajakan",
      type: "cta",
      hidden: false,
      props: {
        title: "Butuh kacamata dari {kota}? Datang ke toko atau pesan online",
        body: "Chat kami untuk tanya stok frame, pilihan lensa, harga, lokasi toko, atau estimasi pengiriman ke alamat Anda.",
        primaryLabel: "Pesan via WhatsApp",
        primaryMessage: "Halo {store}, saya mau tanya stok dan harga kacamata.",
        secondaryLabel: "Lihat Katalog Produk",
        secondaryHref: "/produk",
      },
    },
  ];
}
