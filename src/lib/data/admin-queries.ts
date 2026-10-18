import "server-only";

import { connection } from "next/server";

import { normalizeBlocks } from "@/lib/blocks/normalize";
import { defaultBlocksFor } from "@/lib/blocks/registry";
import { getLayout } from "@/lib/layouts";
import type { Block, PageSource } from "@/lib/blocks/types";
import { requireAdmin } from "@/lib/supabase/admin";
import { isSchemaMissing } from "@/lib/supabase/env";
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

export type HomeEditorState = {
  /** Tata letak yang sedang diedit — menentukan halaman mana yang dibuka */
  layout: string;
  blocks: Block[];
  /** Dari mana `blocks` dibaca: draft, yang terbit, atau bawaan kode */
  source: PageSource;
  /** Draft berbeda dari yang sedang terbit */
  unpublished: boolean;
  /** False bila tabel v5 belum dibuat di Supabase */
  schemaReady: boolean;
};

/**
 * Keadaan editor halaman depan: draft bila ada, kalau tidak yang terbit,
 * kalau tidak susunan bawaan. Dipakai editor dan halaman pratinjau.
 */
export async function loadHomeEditorState(): Promise<HomeEditorState> {
  // Selalu dirender saat ada permintaan, tidak pernah di-prerender: isinya
  // draft pribadi admin, dan pemeriksaan login harus berjalan tiap kali —
  // bukan hanya kebetulan dinamis karena memakai cookies.
  await connection();
  const { supabase } = await requireAdmin();

  // Kolom layout baru ada sejak v11; bila belum ada (error), pakai klasik.
  const { data: settings } = await supabase
    .from("store_settings")
    .select("layout")
    .limit(1)
    .maybeSingle();
  const layout = getLayout((settings as { layout?: string | null } | null)?.layout);

  const [draftResult, publishedResult] = await Promise.all([
    supabase.from("site_page_drafts").select("blocks").eq("slug", layout.pageSlug).maybeSingle(),
    supabase.from("site_pages").select("blocks").eq("slug", layout.pageSlug).maybeSingle(),
  ]);

  const schemaReady = !(
    isSchemaMissing(draftResult.error) || isSchemaMissing(publishedResult.error)
  );

  const published = publishedResult.data
    ? normalizeBlocks(publishedResult.data.blocks)
    : null;
  const effectivePublished = published ?? defaultBlocksFor(layout.id);

  if (draftResult.data) {
    const draft = normalizeBlocks(draftResult.data.blocks);
    return {
      layout: layout.id,
      blocks: draft,
      source: "draft",
      unpublished: JSON.stringify(draft) !== JSON.stringify(effectivePublished),
      schemaReady,
    };
  }

  return {
    layout: layout.id,
    blocks: effectivePublished,
    source: published ? "published" : "default",
    unpublished: false,
    schemaReady,
  };
}
