import type { MetadataRoute } from "next";

import { getCategories, getProducts } from "@/lib/data/queries";
import { absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);

  return [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/produk"), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/cara-pesan"), changeFrequency: "yearly", priority: 0.4 },
    { url: absoluteUrl("/tentang"), changeFrequency: "yearly", priority: 0.4 },
    ...categories.map((category) => ({
      url: absoluteUrl(`/kategori/${category.slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...products.map((product) => ({
      url: absoluteUrl(`/produk/${product.slug}`),
      lastModified: product.created_at,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
