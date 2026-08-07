import type { AttributeType, Product, ProductAttribute } from "@/lib/types";

/**
 * Definisi filter katalog.
 *
 * Penyaringan dan penghitungan jumlah dilakukan di sini — bukan lewat SQL
 * per-facet — supaya jalur data contoh dan Supabase berperilaku sama persis,
 * angka di tiap opsi selalu akurat, dan menambah facet baru tidak perlu
 * mengubah query. Cocok sampai sekitar seribu produk per kategori; di atas
 * itu perlu dipindah ke agregasi di database.
 */

/** Kelompok ukuran frame. Batasnya di sini agar mudah disetel ulang. */
export const SIZE_BUCKETS = [
  { slug: "sempit", name: "Sempit", hint: "≤ 49 mm", max: 49 },
  { slug: "sedang", name: "Sedang", hint: "50 – 54 mm", min: 50, max: 54 },
  { slug: "lebar", name: "Lebar", hint: "≥ 55 mm", min: 55 },
] as const;

export type SizeSlug = (typeof SIZE_BUCKETS)[number]["slug"];

export const PRICE_BUCKETS = [
  { slug: "di-bawah-300", name: "Di bawah Rp300rb", max: 299_999 },
  { slug: "300-700", name: "Rp300rb – Rp700rb", min: 300_000, max: 700_000 },
  { slug: "700-1500", name: "Rp700rb – Rp1,5jt", min: 700_001, max: 1_500_000 },
  { slug: "di-atas-1500", name: "Di atas Rp1,5jt", min: 1_500_001 },
] as const;

export type PriceSlug = (typeof PRICE_BUCKETS)[number]["slug"];

export type CatalogFilters = {
  bentuk: string[];
  material: string[];
  warna: string[];
  ukuran: string[];
  merek: string[];
  harga: string[];
};

export const EMPTY_FILTERS: CatalogFilters = {
  bentuk: [],
  material: [],
  warna: [],
  ukuran: [],
  merek: [],
  harga: [],
};

export const FILTER_KEYS = Object.keys(EMPTY_FILTERS) as (keyof CatalogFilters)[];

/** Nama parameter URL untuk tiap filter — sengaja dibuat pendek dan terbaca */
export const FILTER_PARAM: Record<keyof CatalogFilters, string> = {
  bentuk: "bentuk",
  material: "material",
  warna: "warna",
  ukuran: "ukuran",
  merek: "merek",
  harga: "harga",
};

/** Baca filter dari query string. Nilai ganda dipisah koma. */
export function parseFilters(
  searchParams: Record<string, string | string[] | undefined>,
): CatalogFilters {
  const read = (key: string): string[] => {
    const raw = searchParams[key];
    const value = Array.isArray(raw) ? raw.join(",") : raw;
    if (!value) return [];
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  return {
    bentuk: read(FILTER_PARAM.bentuk),
    material: read(FILTER_PARAM.material),
    warna: read(FILTER_PARAM.warna),
    ukuran: read(FILTER_PARAM.ukuran),
    merek: read(FILTER_PARAM.merek),
    harga: read(FILTER_PARAM.harga),
  };
}

export function hasActiveFilters(filters: CatalogFilters): boolean {
  return FILTER_KEYS.some((key) => filters[key].length > 0);
}

export function countActiveFilters(filters: CatalogFilters): number {
  return FILTER_KEYS.reduce((sum, key) => sum + filters[key].length, 0);
}

// ------------------------------------------------------------ pencocokan

function attributeSlugs(product: Product, type: AttributeType): string[] {
  return product.attributes
    .filter((attribute) => attribute.type === type)
    .map((attribute) => attribute.slug);
}

function sizeSlugOf(product: Product): SizeSlug | null {
  const width = product.lens_width_mm;
  if (width == null) return null;

  const bucket = SIZE_BUCKETS.find(
    (item) =>
      width >= ("min" in item ? item.min : -Infinity) &&
      width <= ("max" in item ? item.max : Infinity),
  );
  return bucket?.slug ?? null;
}

function priceSlugOf(product: Product): PriceSlug | null {
  const bucket = PRICE_BUCKETS.find(
    (item) =>
      product.price >= ("min" in item ? item.min : -Infinity) &&
      product.price <= ("max" in item ? item.max : Infinity),
  );
  return bucket?.slug ?? null;
}

/** Nilai produk untuk satu dimensi filter. Selalu array agar seragam. */
function valuesFor(product: Product, key: keyof CatalogFilters): string[] {
  switch (key) {
    case "bentuk":
      return attributeSlugs(product, "bentuk");
    case "material":
      return attributeSlugs(product, "material");
    case "warna":
      return attributeSlugs(product, "warna");
    case "ukuran": {
      const size = sizeSlugOf(product);
      return size ? [size] : [];
    }
    case "merek":
      return product.brand ? [product.brand] : [];
    case "harga": {
      const price = priceSlugOf(product);
      return price ? [price] : [];
    }
  }
}

/**
 * Cocok bila untuk SETIAP dimensi yang dipilih, produk punya
 * SALAH SATU nilainya — AND antar dimensi, OR di dalam dimensi.
 * Ini perilaku yang diharapkan orang: "kotak atau bundar" DAN "hitam".
 */
function matches(
  product: Product,
  filters: CatalogFilters,
  ignore?: keyof CatalogFilters,
): boolean {
  return FILTER_KEYS.every((key) => {
    if (key === ignore) return true;
    const selected = filters[key];
    if (selected.length === 0) return true;

    const values = valuesFor(product, key);
    return selected.some((slug) => values.includes(slug));
  });
}

export function applyFilters(
  products: Product[],
  filters: CatalogFilters,
): Product[] {
  if (!hasActiveFilters(filters)) return products;
  return products.filter((product) => matches(product, filters));
}

// ---------------------------------------------------------------- facet

export type FacetOption = {
  slug: string;
  name: string;
  count: number;
  swatchHex?: string | null;
  hint?: string;
};

export type Facets = Record<keyof CatalogFilters, FacetOption[]>;

/**
 * Hitung jumlah produk per opsi.
 *
 * Untuk tiap dimensi, hitungnya memakai produk yang lolos SEMUA filter lain
 * kecuali dimensi itu sendiri. Efeknya: memilih "Hitam" tidak membuat opsi
 * warna lain langsung menjadi nol, sehingga pengunjung masih bisa berpindah
 * pilihan — perilaku yang sama seperti di toko online besar.
 */
export function buildFacets(
  products: Product[],
  filters: CatalogFilters,
  attributes: ProductAttribute[],
): Facets {
  const tally = (key: keyof CatalogFilters) => {
    const counts = new Map<string, number>();
    for (const product of products) {
      if (!matches(product, filters, key)) continue;
      for (const value of valuesFor(product, key)) {
        counts.set(value, (counts.get(value) ?? 0) + 1);
      }
    }
    return counts;
  };

  const fromAttributes = (type: AttributeType): FacetOption[] => {
    const counts = tally(type);
    return attributes
      .filter((attribute) => attribute.type === type)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((attribute) => ({
        slug: attribute.slug,
        name: attribute.name,
        count: counts.get(attribute.slug) ?? 0,
        swatchHex: attribute.swatch_hex,
      }))
      // Sembunyikan opsi yang tidak dipakai produk mana pun, kecuali
      // sedang dipilih — supaya filter aktif tidak tiba-tiba hilang.
      .filter(
        (option) =>
          option.count > 0 || filters[type].includes(option.slug),
      );
  };

  const sizeCounts = tally("ukuran");
  const priceCounts = tally("harga");
  const brandCounts = tally("merek");

  return {
    bentuk: fromAttributes("bentuk"),
    material: fromAttributes("material"),
    warna: fromAttributes("warna"),
    ukuran: SIZE_BUCKETS.map((bucket) => ({
      slug: bucket.slug,
      name: bucket.name,
      hint: bucket.hint,
      count: sizeCounts.get(bucket.slug) ?? 0,
    })).filter(
      (option) => option.count > 0 || filters.ukuran.includes(option.slug),
    ),
    harga: PRICE_BUCKETS.map((bucket) => ({
      slug: bucket.slug,
      name: bucket.name,
      count: priceCounts.get(bucket.slug) ?? 0,
    })).filter(
      (option) => option.count > 0 || filters.harga.includes(option.slug),
    ),
    merek: [...brandCounts.entries()]
      .map(([slug, count]) => ({ slug, name: slug, count }))
      .sort((a, b) => a.name.localeCompare(b.name, "id")),
  };
}

/** Label yang tampil di chip filter aktif */
export function labelFor(
  key: keyof CatalogFilters,
  slug: string,
  facets: Facets,
): string {
  return facets[key].find((option) => option.slug === slug)?.name ?? slug;
}

export const FILTER_GROUP_LABEL: Record<keyof CatalogFilters, string> = {
  bentuk: "Bentuk",
  harga: "Harga",
  material: "Material",
  warna: "Warna",
  ukuran: "Ukuran",
  merek: "Merek",
};
