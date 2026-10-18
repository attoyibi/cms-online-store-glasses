import type { Metadata } from "next";

import { LivePreview } from "@/components/blocks/live-preview";
import { loadHomeEditorState } from "@/lib/data/admin-queries";
import {
  getCategories,
  getProducts,
  getSiteIdentity,
} from "@/lib/data/queries";
import { textVars } from "@/lib/site-identity";

export const metadata: Metadata = {
  title: "Pratinjau langsung",
  robots: { index: false, follow: false },
};

/**
 * Halaman yang dimuat di dalam iframe editor. Hanya untuk admin yang login
 * (`loadHomeEditorState` mengarahkan ke halaman masuk bila bukan).
 *
 * Produk dan kategori dimuat sekali di sini; setelah itu setiap ketikan admin
 * dirender di browser tanpa bertanya lagi ke server. Batas 200 produk cukup
 * untuk toko UMKM; kelebihannya hanya tidak muncul di pratinjau, bukan di
 * halaman sungguhan.
 */
export default async function LivePreviewPage() {
  const state = await loadHomeEditorState();
  const [products, categories, identity] = await Promise.all([
    getProducts({ limit: 200 }),
    getCategories(),
    getSiteIdentity(),
  ]);

  return (
    <LivePreview
      initialBlocks={state.blocks}
      products={products}
      categories={categories}
      vars={textVars(identity)}
      layout={state.layout}
    />
  );
}
