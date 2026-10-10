import { siteConfig } from "@/lib/site-config";
import type { Product } from "@/lib/types";
import { hasVariants, priceRange } from "@/lib/variants";

/** Ubah path relatif (`/products/x.svg`) jadi URL penuh; URL penuh dibiarkan */
export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return new URL(pathOrUrl, siteConfig.url).toString();
}

/** Data terstruktur schema.org/Product supaya produk bisa tampil sebagai rich result */
export function productJsonLd(product: Product) {
  const availability =
    product.stock > 0
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock";

  // Produk bervarian: satu rentang harga, bukan satu angka yang menyesatkan
  const range = priceRange(product);
  const offers = hasVariants(product)
    ? {
        "@type": "AggregateOffer",
        url: absoluteUrl(`/produk/${product.slug}`),
        priceCurrency: "IDR",
        lowPrice: range.min,
        highPrice: range.max,
        offerCount: product.variants.length,
        availability,
      }
    : {
        "@type": "Offer",
        url: absoluteUrl(`/produk/${product.slug}`),
        priceCurrency: "IDR",
        price: product.price,
        availability,
      };

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    image: product.images.map(absoluteUrl),
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    category: product.category?.name,
    offers,
  };
}

/**
 * Serialisasi JSON-LD untuk disisipkan di <script>. Karakter `<` di-escape
 * supaya teks dari CMS (mis. "</script>" di deskripsi) tidak bisa menutup tag.
 */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
