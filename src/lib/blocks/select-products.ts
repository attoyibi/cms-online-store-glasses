import type { ShowcaseSource } from "@/lib/blocks/types";
import type { Product } from "@/lib/types";

/**
 * Memilih produk untuk blok (deretan produk, lensa) dari daftar produk yang
 * SUDAH ada di memori. Dipakai pratinjau langsung di editor, yang tidak
 * boleh menanyai database setiap kali admin mengetik.
 *
 * Aturannya sengaja sama dengan query di `getProducts` (produk aktif,
 * terbaru lebih dulu), supaya pratinjau menampilkan produk yang sama dengan
 * halaman sungguhan. Daftar `all` harus sudah berurutan terbaru-lebih-dulu.
 */
export function pickProducts(
  query: {
    source: ShowcaseSource;
    categorySlug: string;
    limit: number;
  },
  all: Product[],
): Product[] {
  if (query.limit <= 0) return [];

  let rows = all;
  switch (query.source) {
    case "unggulan":
      rows = all.filter((product) => product.is_featured);
      break;
    case "kategori":
      // Slug kosong = belum diatur; jangan menampilkan semua produk
      rows = query.categorySlug
        ? all.filter((product) => product.category?.slug === query.categorySlug)
        : [];
      break;
    case "terbaru":
      break;
  }

  return rows.slice(0, query.limit);
}
