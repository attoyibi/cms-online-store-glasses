/**
 * Identitas toko. Nilai di sini dipakai sebagai default dan bisa
 * ditimpa lewat tabel `store_settings` di Supabase (diatur dari admin CMS).
 */
export const siteConfig = {
  name: "Lensara",
  tagline: "Optik Modern Yogyakarta",
  description:
    "Toko kacamata online dengan koleksi frame, lensa, dan sunglasses pilihan. Konsultasi gratis, pesan langsung lewat WhatsApp, kirim ke seluruh Indonesia.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  /** Nomor WhatsApp tujuan pesanan, format internasional tanpa "+" */
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "6281234567890",
  city: "Yogyakarta",
  address: "Jl. Kaliurang KM 5, Sleman, Daerah Istimewa Yogyakarta",
  email: "halo@lensara.id",
  instagram: "https://instagram.com/",
  openHours: "Setiap hari, 09.00 – 21.00 WIB",
} as const;

export const mainNav = [
  { label: "Beranda", href: "/" },
  { label: "Semua Produk", href: "/produk" },
  { label: "Kacamata Pria", href: "/kategori/kacamata-pria" },
  { label: "Kacamata Wanita", href: "/kategori/kacamata-wanita" },
  { label: "Sunglasses", href: "/kategori/sunglasses" },
  { label: "Lensa", href: "/kategori/lensa" },
] as const;
