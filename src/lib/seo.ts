import { siteConfig } from "@/lib/site-config";
import type { Product } from "@/lib/types";

/** Ubah path relatif (`/products/x.svg`) jadi URL penuh; URL penuh dibiarkan */
export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return new URL(pathOrUrl, siteConfig.url).toString();
}

/** Data terstruktur schema.org/Product supaya produk bisa tampil sebagai rich result */
export function productJsonLd(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    image: product.images.map(absoluteUrl),
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    category: product.category?.name,
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/produk/${product.slug}`),
      priceCurrency: "IDR",
      price: product.price,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };
}

/**
 * Serialisasi JSON-LD untuk disisipkan di <script>. Karakter `<` di-escape
 * supaya teks dari CMS (mis. "</script>" di deskripsi) tidak bisa menutup tag.
 */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
