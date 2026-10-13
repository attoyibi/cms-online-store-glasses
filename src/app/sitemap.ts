import type { MetadataRoute } from "next";

import {
  getCategories,
  getProducts,
  getSiteIdentity,
} from "@/lib/data/queries";
import { absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const identity = await getSiteIdentity();
  // Situs yang sengaja disembunyikan dari mesin pencari tidak boleh
  // mengiklankan daftar halamannya.
  if (identity.noindexSite) return [];

  const base = identity.siteUrl;
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);

  return [
    { url: absoluteUrl("/", base), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/produk", base), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/cara-pesan", base), changeFrequency: "yearly", priority: 0.4 },
    { url: absoluteUrl("/tentang", base), changeFrequency: "yearly", priority: 0.4 },
    ...categories.map((category) => ({
      url: absoluteUrl(`/kategori/${category.slug}`, base),
      lastModified: category.updated_at ?? undefined,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...products.map((product) => ({
      url: absoluteUrl(`/produk/${product.slug}`, base),
      // Terakhir diubah, bukan tanggal dibuat — sinyal yang lebih jujur bagi Google
      lastModified: product.updated_at ?? product.created_at,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
