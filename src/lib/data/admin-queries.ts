import "server-only";

import { requireAdmin } from "@/lib/supabase/admin";
import type { Category, ProductAttribute } from "@/lib/types";

/**
 * Pilihan yang dibutuhkan form produk: kategori, daftar atribut filter,
 * dan merek yang sudah pernah dipakai.
 *
 * Merek sengaja diambil dari data yang ada dan disajikan sebagai saran
 * ketik, bukan tabel tersendiri — supaya menambah merek baru tidak perlu
 * langkah ekstra, tapi ejaannya tetap konsisten.
 */
export async function loadProductFormOptions(): Promise<{
  categories: Category[];
  attributes: ProductAttribute[];
  brands: string[];
}> {
  const { supabase } = await requireAdmin();

  const [categoriesResult, attributesResult, brandsResult] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase
      .from("product_attributes")
      .select("*")
      .order("type")
      .order("sort_order"),
    supabase.from("products").select("brand").not("brand", "is", null),
  ]);

  const brands = [
    ...new Set(
      ((brandsResult.data ?? []) as { brand: string | null }[])
        .map((row) => row.brand)
        .filter((brand): brand is string => Boolean(brand)),
    ),
  ].sort((a, b) => a.localeCompare(b, "id"));

  return {
    categories: (categoriesResult.data ?? []) as Category[],
    // Kosong bila migrasi v2 belum dijalankan — form tetap bisa dipakai
    attributes: (attributesResult.data ?? []) as ProductAttribute[],
    brands,
  };
}
