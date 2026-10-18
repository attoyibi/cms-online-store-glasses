import "server-only";

import { cache } from "react";

import {
  sampleAttributes,
  sampleCategories,
  sampleProducts,
} from "@/lib/data/sample-data";
import { normalizeBlocks } from "@/lib/blocks/normalize";
import { defaultBlocksFor } from "@/lib/blocks/registry";
import { getLayout } from "@/lib/layouts";
import type { Block } from "@/lib/blocks/types";
import {
  applyFilters,
  buildFacets,
  type CatalogFilters,
  type Facets,
} from "@/lib/filters";
import { buildIdentity, type SiteIdentity } from "@/lib/site-identity";
import { siteConfig } from "@/lib/site-config";
import { withVariantSummary } from "@/lib/variants";
import { isSchemaMissing } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type {
  Category,
  Product,
  ProductAttribute,
  ProductVariant,
  SeoPage,
  SeoPageSlug,
  SeoSettings,
  StoreSettings,
} from "@/lib/types";

/** Select terlengkap: atribut filter (v2) + varian (v4) */
const PRODUCT_SELECT_VARIANTS =
  "*, category:categories(id, slug, name), links:product_attribute_links(attribute:product_attributes(*)), variants:product_variants(*)";

/** Tanpa varian — dipakai bila migrasi v4 belum dijalankan */
const PRODUCT_SELECT_FULL =
  "*, category:categories(id, slug, name), links:product_attribute_links(attribute:product_attributes(*))";

/** Cadangan bila v2 belum dijalankan — tabel atributnya belum ada */
const PRODUCT_SELECT_BASIC = "*, category:categories(id, slug, name)";

export type ProductSort = "terbaru" | "termurah" | "termahal" | "nama";

export type ProductQuery = {
  categorySlug?: string;
  search?: string;
  sort?: ProductSort;
  limit?: number;
  featuredOnly?: boolean;
};

const SORT_COLUMN: Record<ProductSort, { column: string; ascending: boolean }> =
  {
    terbaru: { column: "created_at", ascending: false },
    termurah: { column: "price", ascending: true },
    termahal: { column: "price", ascending: false },
    nama: { column: "name", ascending: true },
  };

/** Bentuk baris mentah dari Supabase sebelum atributnya diratakan */
type RawProduct = Omit<Product, "attributes" | "variants"> & {
  links?: { attribute: ProductAttribute | null }[] | null;
  attributes?: ProductAttribute[];
  variants?: ProductVariant[] | null;
};

/** Ratakan hasil join many-to-many menjadi array atribut biasa */
function normalize(rows: RawProduct[]): Product[] {
  return rows.map((row) => {
    const { links, variants, ...rest } = row;
    return withVariantSummary(
      {
        ...rest,
        lens_width_mm: rest.lens_width_mm ?? null,
        attributes: (links ?? [])
          .map((link) => link.attribute)
          .filter((a): a is ProductAttribute => Boolean(a)),
      },
      variants ?? [],
    );
  });
}

// ----------------------------------------------------------- data contoh
//
// Dipakai di dua keadaan: kredensial Supabase belum diisi, ATAU sudah diisi
// tapi migrasi SQL-nya belum dijalankan. Keadaan kedua penting dibedakan
// dari "tabel kosong" — kalau tidak, katalognya tampil kosong tanpa
// penjelasan dan terlihat seperti aplikasinya yang rusak.

function sampleCategoryList(): Category[] {
  return sampleCategories
    .filter((c) => c.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);
}

function sampleProductList(query: ProductQuery): Product[] {
  const { categorySlug, search, sort = "terbaru", limit, featuredOnly } = query;
  let rows = sampleProducts.filter((p) => p.is_active);

  if (categorySlug) rows = rows.filter((p) => p.category?.slug === categorySlug);
  if (featuredOnly) rows = rows.filter((p) => p.is_featured);

  if (search?.trim()) {
    const needle = search.trim().toLowerCase();
    rows = rows.filter(
      (p) =>
        p.name.toLowerCase().includes(needle) ||
        p.brand?.toLowerCase().includes(needle) ||
        p.description?.toLowerCase().includes(needle),
    );
  }

  const { column, ascending } = SORT_COLUMN[sort];
  rows = [...rows].sort((a, b) => {
    const av = a[column as keyof Product];
    const bv = b[column as keyof Product];
    if (typeof av === "number" && typeof bv === "number") {
      return ascending ? av - bv : bv - av;
    }
    const cmp = String(av).localeCompare(String(bv), "id");
    return ascending ? cmp : -cmp;
  });

  return limit ? rows.slice(0, limit) : rows;
}

// --------------------------------------------------------------- queries

export async function getAttributes(): Promise<ProductAttribute[]> {
  const supabase = await createClient();
  if (!supabase) return sampleAttributes;

  const { data, error } = await supabase
    .from("product_attributes")
    .select("*")
    .eq("is_active", true)
    .order("type")
    .order("sort_order");

  if (isSchemaMissing(error)) return sampleAttributes;
  if (error || !data) return [];
  return data as ProductAttribute[];
}

/** Dibungkus cache(): layout, sitemap, dan halaman memanggilnya di request yang sama */
export const getCategories = cache(async (): Promise<Category[]> => {
  const supabase = await createClient();
  if (!supabase) return sampleCategoryList();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (isSchemaMissing(error)) return sampleCategoryList();
  if (error || !data) return [];
  return data as Category[];
});

export async function getCategoryBySlug(
  slug: string,
): Promise<Category | null> {
  const supabase = await createClient();
  const fromSample = () =>
    sampleCategories.find((c) => c.slug === slug && c.is_active) ?? null;

  if (!supabase) return fromSample();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (isSchemaMissing(error)) return fromSample();
  return (data as Category | null) ?? null;
}

export async function getProducts(query: ProductQuery = {}): Promise<Product[]> {
  const { categorySlug, search, sort = "terbaru", limit, featuredOnly } = query;
  const supabase = await createClient();

  if (!supabase) return sampleProductList(query);

  // Saring lewat kolom category_id milik produk itu sendiri. Jangan pakai
  // `.eq("categories.slug", …)`: pada PostgREST filter atas tabel yang
  // di-embed hanya mengosongkan kolom kategorinya, tidak membuang baris
  // produk — akibatnya setiap halaman kategori menampilkan SEMUA produk.
  let categoryId: string | null = null;
  if (categorySlug) {
    const category = await getCategoryBySlug(categorySlug);
    if (!category) return [];
    categoryId = category.id;
  }

  const run = async (select: string) => {
    let builder = supabase.from("products").select(select).eq("is_active", true);

    if (categoryId) builder = builder.eq("category_id", categoryId);
    if (featuredOnly) builder = builder.eq("is_featured", true);
    if (search?.trim()) {
      const needle = `%${search.trim()}%`;
      builder = builder.or(`name.ilike.${needle},brand.ilike.${needle}`);
    }

    const { column, ascending } = SORT_COLUMN[sort];
    builder = builder.order(column, { ascending });
    if (limit) builder = builder.limit(limit);

    return builder;
  };

  let { data, error } = await run(PRODUCT_SELECT_VARIANTS);

  // Migrasi v4 belum dijalankan — ulangi tanpa join varian.
  if (error) ({ data, error } = await run(PRODUCT_SELECT_FULL));

  // Migrasi v2 belum dijalankan — ulangi tanpa join atribut supaya
  // katalog tetap tampil, hanya tanpa filter.
  if (error) ({ data, error } = await run(PRODUCT_SELECT_BASIC));

  // Tabel produknya sendiri belum ada — v1 pun belum dijalankan.
  if (isSchemaMissing(error)) return sampleProductList(query);

  if (error || !data) return [];
  return normalize(data as unknown as RawProduct[]);
}

/**
 * Produk unggulan, dilengkapi yang terbaru bila kurang. Dipakai untuk
 * mengisi halaman yang hasilnya kosong supaya pengunjung tidak buntu.
 */
export async function getRecommendedProducts(limit = 8): Promise<Product[]> {
  const featured = await getProducts({ featuredOnly: true, limit });
  if (featured.length >= limit) return featured;

  const latest = await getProducts({ limit: limit * 2 });
  const seen = new Set(featured.map((product) => product.id));
  return [...featured, ...latest.filter((p) => !seen.has(p.id))].slice(0, limit);
}

export type CatalogResult = {
  /** Produk setelah filter diterapkan */
  products: Product[];
  facets: Facets;
  /** Jumlah sebelum filter — untuk pesan "0 dari 18 produk" */
  totalBeforeFilters: number;
};

/**
 * Sumber data halaman katalog.
 *
 * Filter dan penghitungan jumlah per opsi dikerjakan di sini, bukan di SQL,
 * supaya jalur data contoh dan Supabase berperilaku sama dan angkanya selalu
 * konsisten dengan hasil yang tampil. Lihat catatan di `lib/filters.ts`.
 */
export async function getCatalog(
  query: ProductQuery & { filters: CatalogFilters },
): Promise<CatalogResult> {
  const { filters, ...productQuery } = query;

  const [base, attributes] = await Promise.all([
    getProducts(productQuery),
    getAttributes(),
  ]);

  return {
    products: applyFilters(base, filters),
    facets: buildFacets(base, filters, attributes),
    totalBeforeFilters: base.length,
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const fromSample = () =>
    sampleProducts.find((p) => p.slug === slug && p.is_active) ?? null;

  if (!supabase) return fromSample();

  const run = (select: string) =>
    supabase
      .from("products")
      .select(select)
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

  let { data, error } = await run(PRODUCT_SELECT_VARIANTS);
  if (error) ({ data, error } = await run(PRODUCT_SELECT_FULL));
  if (error) ({ data, error } = await run(PRODUCT_SELECT_BASIC));

  if (isSchemaMissing(error)) return fromSample();
  if (!data) return null;

  return normalize([data as unknown as RawProduct])[0] ?? null;
}

/** Produk lain dari kategori yang sama, tanpa menyertakan produk saat ini */
export async function getRelatedProducts(
  product: Product,
  limit = 4,
): Promise<Product[]> {
  if (!product.category?.slug) return [];
  const rows = await getProducts({
    categorySlug: product.category.slug,
    limit: limit + 1,
  });
  return rows.filter((p) => p.id !== product.id).slice(0, limit);
}

export const getStoreSettings = cache(async (): Promise<StoreSettings> => {
  const fallback: StoreSettings = {
    id: "default",
    store_name: siteConfig.name,
    whatsapp_number: siteConfig.whatsappNumber,
    address: siteConfig.address,
    email: siteConfig.email,
    instagram_url: siteConfig.instagram,
    open_hours: siteConfig.openHours,
    announcement: null,
  };

  const supabase = await createClient();
  if (!supabase) return fallback;

  const { data } = await supabase
    .from("store_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  return (data as StoreSettings | null) ?? fallback;
});

/**
 * Pengaturan SEO & bisnis lokal. Null bila belum diisi, tabelnya belum ada
 * (setup.sql lama), atau Supabase belum dikonfigurasi — pemanggil lalu
 * memakai nilai bawaan, jadi situs tidak pernah gagal gara-gara ini.
 */
export const getSeoSettings = cache(async (): Promise<SeoSettings | null> => {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("seo_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data as SeoSettings;
});

/**
 * SEO halaman statis (beranda, produk, tentang, cara pesan). Daftar kosong
 * bila belum diatur atau tabelnya belum ada — halaman lalu memakai judul
 * dan deskripsi bawaannya.
 */
export const getSeoPages = cache(async (): Promise<SeoPage[]> => {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase.from("seo_pages").select("*");
  if (error || !data) return [];
  return data as SeoPage[];
});

export async function getSeoPage(slug: SeoPageSlug): Promise<SeoPage | null> {
  return (await getSeoPages()).find((page) => page.slug === slug) ?? null;
}

/**
 * Tujuan pengalihan untuk sebuah alamat yang tidak ditemukan, atau null.
 * Hanya dipanggil dari halaman yang akan menjawab 404, jadi tidak menambah
 * beban pada halaman yang normal. Tabel belum ada / galat = tidak ada
 * pengalihan.
 */
export async function findRedirect(path: string): Promise<string | null> {
  if (path.length > 200) return null;

  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("seo_redirects")
    .select("to_path")
    .eq("from_path", path)
    .maybeSingle();

  if (error || !data) return null;
  return (data as { to_path: string }).to_path;
}

/** Identitas toko lengkap (nama, kota, alamat situs, dst.) untuk metadata & data terstruktur */
export const getSiteIdentity = cache(async (): Promise<SiteIdentity> => {
  const [store, seo] = await Promise.all([getStoreSettings(), getSeoSettings()]);
  return buildIdentity(store, seo);
});

/**
 * Apakah kredensial sudah diisi tapi migrasi SQL-nya belum dijalankan.
 * Dipakai untuk menampilkan peringatan di halaman admin — situs publik
 * sendiri tetap jalan memakai data contoh.
 */
export async function isSchemaReady(): Promise<boolean> {
  const supabase = await createClient();
  if (!supabase) return false;

  // Sengaja GET biasa, bukan `head: true` — permintaan HEAD dijawab 204
  // tanpa isi error meskipun tabelnya tidak ada, sehingga tabel yang
  // hilang tidak akan terdeteksi.
  const { error } = await supabase.from("products").select("id").limit(1);

  return !isSchemaMissing(error);
}

/**
 * Susunan halaman depan yang sedang terbit. Bila belum pernah diterbitkan,
 * tabelnya belum ada (migrasi v5), atau Supabase belum dikonfigurasi, yang
 * dipakai adalah susunan bawaan — yang sama persis dengan tampilan semula,
 * jadi situs tidak pernah kosong gara-gara data halaman bermasalah.
 */
export async function getPublishedBlocks(): Promise<Block[]> {
  const layout = getLayout((await getStoreSettings()).layout);
  const defaults = () => defaultBlocksFor(layout.id);

  const supabase = await createClient();
  if (!supabase) return defaults();

  const { data, error } = await supabase
    .from("site_pages")
    .select("blocks")
    .eq("slug", layout.pageSlug)
    .maybeSingle();

  if (error || !data) return defaults();

  const blocks = normalizeBlocks(data.blocks);

  // Ada isi tapi tak satu pun valid (data rusak) — pakai bawaan, bukan halaman kosong.
  // Daftar yang memang kosong sengaja dibiarkan kosong.
  if (blocks.length === 0 && Array.isArray(data.blocks) && data.blocks.length > 0) {
    return defaults();
  }
  return blocks;
}
