/**
 * Tata letak toko.
 *
 * Tema = tata letak + palet warna, dipilih terpisah di Admin → Pengaturan.
 * Palet ada di `themes.ts`; berkas ini hanya menyangkut susunan halaman.
 *
 * Tiap tata letak punya halaman depan sendiri di database (`pageSlug` di
 * tabel site_pages / site_page_drafts), sehingga berpindah tata letak tidak
 * menghapus editan di tata letak lainnya.
 *
 * Yang disimpan di Supabase hanya id-nya: store_settings.layout.
 */

export type Layout = {
  id: string;
  name: string;
  description: string;
  /** Kunci halaman depan di site_pages dan site_page_drafts */
  pageSlug: string;
  /** Belum tersedia = tampil di pemilih tapi tidak bisa dipilih */
  available: boolean;
};

export const DEFAULT_LAYOUT_ID = "klasik";

export const LAYOUTS: Layout[] = [
  {
    id: "klasik",
    name: "Klasik",
    description: "Hero tiga foto, keunggulan, testimoni, dan FAQ. Tampilan bawaan.",
    pageSlug: "home",
    available: true,
  },
  {
    id: "etalase",
    name: "Etalase",
    description:
      "Header dan hero gelap, kartu fitur, grid produk dengan tombol pesan WhatsApp di tiap kartu.",
    pageSlug: "home-etalase",
    available: false,
  },
];

/**
 * Tata letak yang berlaku untuk id dari database atau form. Id yang tidak
 * dikenal, kosong, atau belum tersedia memakai tata letak bawaan — situs
 * tidak pernah rusak karena data yang salah.
 */
export function getLayout(id: string | null | undefined): Layout {
  return (
    LAYOUTS.find((layout) => layout.id === id && layout.available) ?? LAYOUTS[0]
  );
}
