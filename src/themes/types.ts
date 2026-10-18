import type { ReactNode } from "react";

import type { BlockOf, BlockType } from "@/lib/blocks/types";
import type { Category, Product } from "@/lib/types";

/**
 * Tema = paket tampilan. Satu tema boleh menggambar ulang jenis blok mana
 * pun dengan komponennya sendiri; jenis blok yang tidak ditimpa memakai
 * tampilan klasik. Isi (props) blok tetap sama, sehingga editor Halaman
 * Depan, undo, dan pratinjau langsung bekerja tanpa perubahan.
 *
 * Menambah tema baru:
 *  1. daftarkan id-nya di `lib/layouts.ts` (nama, deskripsi, slug halaman)
 *  2. buat folder `themes/<id>/` berisi komponen dan susunan bawaan
 *  3. sambungkan di `themes/views.tsx` dan `themes/defaults.ts`
 */

/** Data tambahan yang diterima tampilan sebuah blok */
export type BlockViewContext = {
  products: Product[];
  categories: Category[];
  /** Gambar pertama dimuat lebih awal (deretan produk pertama di halaman) */
  priority: boolean;
};

export type BlockViewMap = {
  [K in BlockType]?: (block: BlockOf<K>, context: BlockViewContext) => ReactNode;
};
