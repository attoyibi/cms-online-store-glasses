import type { MetadataRoute } from "next";

import { getSiteIdentity } from "@/lib/data/queries";
import { absoluteUrl } from "@/lib/seo";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const identity = await getSiteIdentity();

  // Saklar "sembunyikan dari mesin pencari" di Admin → SEO & Toko
  if (identity.noindexSite) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // CMS dan keranjang tidak berguna di hasil pencarian
      disallow: ["/admin", "/checkout", "/pratinjau"],
    },
    sitemap: absoluteUrl("/sitemap.xml", identity.siteUrl),
  };
}
