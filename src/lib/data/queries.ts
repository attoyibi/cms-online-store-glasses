import "server-only";

import { sampleCategories, sampleProducts } from "@/lib/data/sample-data";
import { siteConfig } from "@/lib/site-config";
import { createClient } from "@/lib/supabase/server";
import type { Category, Product, StoreSettings } from "@/lib/types";

const PRODUCT_SELECT = "*, category:categories(id, slug, name)";

export type ProductSort = "terbaru" | "termurah" | "termahal" | "nama";

export type ProductQuery = {
  categorySlug?: string;
  search?: string;
  sort?: ProductSort;
  limit?: number;
  featuredOnly?: boolean;
};

/** Urutan yang sama dipakai baik oleh Supabase maupun data contoh */
const SORT_COLUMN: Record<ProductSort, { column: string; ascending: boolean }> =
  {
    terbaru: { column: "created_at", ascending: false },
    termurah: { column: "price", ascending: true },
    termahal: { column: "price", ascending: false },
    nama: { column: "name", ascending: true },
  };

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  if (!supabase) {
    return sampleCategories
      .filter((c) => c.is_active)
      .sort((a, b) => a.sort_order - b.sort_order);
  }

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error || !data) return [];
  return data as Category[];
}

export async function getCategoryBySlug(
  slug: string,
): Promise<Category | null> {
  const supabase = await createClient();
  if (!supabase) {
    return sampleCategories.find((c) => c.slug === slug && c.is_active) ?? null;
  }

  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  return (data as Category | null) ?? null;
}

export async function getProducts(query: ProductQuery = {}): Promise<Product[]> {
  const { categorySlug, search, sort = "terbaru", limit, featuredOnly } = query;
  const supabase = await createClient();

  if (!supabase) {
    let rows = sampleProducts.filter((p) => p.is_active);

    if (categorySlug) {
      rows = rows.filter((p) => p.category?.slug === categorySlug);
    }
    if (featuredOnly) {
      rows = rows.filter((p) => p.is_featured);
    }
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

  let builder = supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true);

  if (categorySlug) {
    builder = builder.eq("categories.slug", categorySlug);
  }
  if (featuredOnly) {
    builder = builder.eq("is_featured", true);
  }
  if (search?.trim()) {
    const needle = `%${search.trim()}%`;
    builder = builder.or(`name.ilike.${needle},brand.ilike.${needle}`);
  }

  const { column, ascending } = SORT_COLUMN[sort];
  builder = builder.order(column, { ascending });
  if (limit) builder = builder.limit(limit);

  const { data, error } = await builder;
  if (error || !data) return [];
  return data as unknown as Product[];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  if (!supabase) {
    return sampleProducts.find((p) => p.slug === slug && p.is_active) ?? null;
  }

  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  return (data as unknown as Product | null) ?? null;
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

export async function getStoreSettings(): Promise<StoreSettings> {
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
}
