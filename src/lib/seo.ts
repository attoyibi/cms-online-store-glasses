import type { SiteIdentity } from "@/lib/site-identity";
import type { Product } from "@/lib/types";
import { hasVariants, priceRange } from "@/lib/variants";

/**
 * Ubah path relatif (`/products/x.svg`) jadi URL penuh; URL penuh dibiarkan.
 * `base` adalah alamat situs dari identitas toko (Admin → SEO & Toko).
 */
export function absoluteUrl(pathOrUrl: string, base: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return new URL(pathOrUrl, base).toString();
}

/** Data terstruktur schema.org/Product supaya produk bisa tampil sebagai rich result */
export function productJsonLd(product: Product, base: string) {
  const availability =
    product.stock > 0
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock";
  const url = absoluteUrl(`/produk/${product.slug}`, base);

  // Produk bervarian: satu rentang harga, bukan satu angka yang menyesatkan
  const range = priceRange(product);
  const offers = hasVariants(product)
    ? {
        "@type": "AggregateOffer",
        url,
        priceCurrency: "IDR",
        lowPrice: range.min,
        highPrice: range.max,
        offerCount: product.variants.length,
        availability,
      }
    : {
        "@type": "Offer",
        url,
        priceCurrency: "IDR",
        price: product.price,
        availability,
      };

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    image: product.images.map((src) => absoluteUrl(src, base)),
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    category: product.category?.name,
    offers,
  };
}

/** Gambar pertama yang layak dibagikan. SVG tidak ditampilkan WhatsApp/Facebook/X. */
export function shareableImage(images: string[]): string | undefined {
  return images.find((src) => !src.toLowerCase().endsWith(".svg"));
}

/** Data terstruktur BreadcrumbList — jejak halaman yang tampil di hasil Google */
export function breadcrumbJsonLd(
  items: { name: string; path: string }[],
  base: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path, base),
    })),
  };
}

/** Apakah alamat situs masih nilai bawaan lokal — tanda alamat situs belum diisi */
export function siteUrlIsPlaceholder(base: string): boolean {
  return /localhost|127\.0\.0\.1/.test(base);
}

/** Nomor telepon → format internasional (+62...) untuk data terstruktur */
export function toE164(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) return null;
  if (digits.startsWith("62")) return `+${digits}`;
  if (digits.startsWith("0")) return `+62${digits.slice(1)}`;
  if (phone.trim().startsWith("+")) return `+${digits}`;
  return `+62${digits}`;
}

const SCHEMA_DAYS: Record<string, string> = {
  Mo: "Monday",
  Tu: "Tuesday",
  We: "Wednesday",
  Th: "Thursday",
  Fr: "Friday",
  Sa: "Saturday",
  Su: "Sunday",
};

/**
 * Data terstruktur toko fisik (schema.org/Optician) — bahan kartu bisnis di
 * hasil pencarian lokal. Hanya dibuat bila ada alamat, karena Google
 * mewajibkan nama dan alamat; data setengah jadi lebih baik tidak dikirim.
 */
export function localBusinessJsonLd(identity: SiteIdentity) {
  const street = identity.streetAddress ?? identity.address;
  if (!street) return null;

  const telephone = toE164(identity.phone ?? identity.whatsappNumber);
  const hasHours =
    identity.openDays.length > 0 &&
    identity.opens !== null &&
    identity.closes !== null;
  const hasGeo = identity.latitude !== null && identity.longitude !== null;

  return {
    "@context": "https://schema.org",
    "@type": "Optician",
    "@id": `${identity.siteUrl}/#toko`,
    name: identity.name,
    url: identity.siteUrl,
    description: identity.description,
    image: identity.ogImage
      ? absoluteUrl(identity.ogImage, identity.siteUrl)
      : undefined,
    logo: identity.logo ? absoluteUrl(identity.logo, identity.siteUrl) : undefined,
    telephone: telephone ?? undefined,
    email: identity.email ?? undefined,
    priceRange: identity.priceRange ?? undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: street,
      addressLocality: identity.city,
      addressRegion: identity.region || undefined,
      postalCode: identity.postalCode ?? undefined,
      addressCountry: "ID",
    },
    geo: hasGeo
      ? {
          "@type": "GeoCoordinates",
          latitude: identity.latitude,
          longitude: identity.longitude,
        }
      : undefined,
    openingHoursSpecification: hasHours
      ? [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: identity.openDays
              .map((d) => SCHEMA_DAYS[d])
              .filter(Boolean),
            opens: identity.opens,
            closes: identity.closes,
          },
        ]
      : undefined,
    areaServed: identity.city,
    sameAs: identity.sameAs.length > 0 ? identity.sameAs : undefined,
  };
}

/** Data terstruktur situs + kotak pencarian (untuk halaman beranda) */
export function websiteJsonLd(identity: SiteIdentity) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${identity.siteUrl}/#situs`,
    url: identity.siteUrl,
    name: identity.name,
    inLanguage: "id-ID",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${identity.siteUrl}/produk?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
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
