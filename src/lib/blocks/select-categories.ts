import type { Category } from "@/lib/types";

/**
 * Pengaturan kartu kategori di beranda disimpan sebagai satu daftar teks:
 * slug berurutan sesuai tampilan, dan slug berawalan "!" artinya disembunyikan.
 * Contoh: ["kacamata-pria", "!lap-kacamata", "lensa"].
 *
 * Kategori yang tidak disebut (mis. baru ditambah) otomatis tampil di urutan
 * paling akhir, jadi kategori baru tidak pernah "hilang" diam-diam.
 */
export type CategoryRow = { slug: string; name: string; visible: boolean };

const HIDDEN = "!";

/** Semua kategori sebagai baris berurutan, lengkap dengan status tampil */
export function buildCategoryRows(
  categories: { slug: string; name: string }[],
  entries: readonly string[] | undefined,
): CategoryRow[] {
  const bySlug = new Map(categories.map((category) => [category.slug, category]));
  const rows: CategoryRow[] = [];
  const seen = new Set<string>();

  for (const entry of entries ?? []) {
    const hidden = entry.startsWith(HIDDEN);
    const slug = hidden ? entry.slice(HIDDEN.length) : entry;
    const category = bySlug.get(slug);
    if (!category || seen.has(slug)) continue;
    seen.add(slug);
    rows.push({ slug, name: category.name, visible: !hidden });
  }

  for (const category of categories) {
    if (!seen.has(category.slug)) {
      rows.push({ slug: category.slug, name: category.name, visible: true });
    }
  }
  return rows;
}

export function serializeCategoryRows(rows: readonly CategoryRow[]): string[] {
  return rows.map((row) => (row.visible ? row.slug : `${HIDDEN}${row.slug}`));
}

/** Kategori yang akan digambar di beranda: sudah diurutkan, tanpa yang disembunyikan */
export function arrangeCategories(
  categories: Category[],
  entries: readonly string[] | undefined,
): Category[] {
  const bySlug = new Map(categories.map((category) => [category.slug, category]));
  return buildCategoryRows(categories, entries)
    .filter((row) => row.visible)
    .map((row) => bySlug.get(row.slug))
    .filter((category): category is Category => Boolean(category));
}
