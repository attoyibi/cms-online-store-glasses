import type { MetadataRoute } from "next";

import {
  getCategories,
  getProducts,
  getSeoPages,
  getSiteIdentity,
} from "@/lib/data/queries";
import { absoluteUrl } from "@/lib/seo";
import type { SeoPageSlug } from "@/lib/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const identity = await getSiteIdentity();
  // Situs yang sengaja disembunyikan dari mesin pencari tidak boleh
  // mengiklankan daftar halamannya.
  if (identity.noindexSite) return [];

  const base = identity.siteUrl;
  const [categories, products, pages] = await Promise.all([
    getCategories(),
    getProducts(),
    getSeoPages(),
  ]);
  // Halaman yang ditandai “sembunyikan dari Google” tidak masuk sitemap
  const hidden = new Set(pages.filter((p) => p.noindex).map((p) => p.slug));

  const staticPages: {
    slug: SeoPageSlug;
    path: string;
    changeFrequency: "daily" | "weekly" | "yearly";
    priority: number;
  }[] = [
    { slug: "beranda", path: "/", changeFrequency: "weekly", priority: 1 },
    { slug: "produk", path: "/produk", changeFrequency: "daily", priority: 0.9 },
    { slug: "cara-pesan", path: "/cara-pesan", changeFrequency: "yearly", priority: 0.4 },
    { slug: "tentang", path: "/tentang", changeFrequency: "yearly", priority: 0.4 },
  ];
  const statics: MetadataRoute.Sitemap = staticPages
    .filter((entry) => !hidden.has(entry.slug))
    .map(({ path, changeFrequency, priority }) => ({
      url: absoluteUrl(path, base),
      changeFrequency,
      priority,
    }));

  return [
    ...statics,
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
