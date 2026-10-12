import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // CMS dan keranjang tidak berguna di hasil pencarian
      disallow: ["/admin", "/checkout", "/pratinjau"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
