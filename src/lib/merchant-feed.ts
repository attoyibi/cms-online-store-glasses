import { absoluteUrl } from "@/lib/seo";
import { clipText, productSeo } from "@/lib/seo-meta";
import type { SiteIdentity } from "@/lib/site-identity";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";

export type FeedSkip = { name: string; slug: string; reason: string };

export type MerchantFeed = {
  xml: string;
  included: number;
  skipped: FeedSkip[];
};

const isSvg = (src: string) => /\.svg($|\?)/i.test(src);

/** Escape untuk isi elemen XML. Karakter kontrol yang tidak sah dibuang. */
export function xmlEscape(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const money = (amount: number) => `${amount.toFixed(2)} IDR`;

const tag = (name: string, value: string | number | null | undefined) =>
  value === null || value === undefined || value === ""
    ? ""
    : `      <${name}>${xmlEscape(String(value))}</${name}>\n`;

/**
 * Feed produk format Google Merchant Center (RSS 2.0 + namespace g:), yang
 * juga diterima katalog Meta/Instagram dan TikTok.
 *
 * Satu item per produk. Produk bervarian ditulis dengan harga termurah,
 * sama seperti di katalog toko. Produk yang tidak memenuhi syarat dasar
 * (belum ada foto PNG/JPG, atau harga 0) dilewati dan dilaporkan.
 */
export function buildMerchantFeed(
  identity: SiteIdentity,
  products: Product[],
): MerchantFeed {
  const base = identity.siteUrl;
  const skipped: FeedSkip[] = [];
  let items = "";
  let included = 0;

  for (const product of products) {
    if (!product.is_active) continue;

    const photos = product.images.filter((src) => !isSvg(src));
    if (photos.length === 0) {
      skipped.push({
        name: product.name,
        slug: product.slug,
        reason:
          product.images.length === 0
            ? "Belum ada foto"
            : "Semua fotonya SVG; Merchant Center hanya menerima PNG/JPG",
      });
      continue;
    }
    if (!(product.price > 0)) {
      skipped.push({ name: product.name, slug: product.slug, reason: "Harga belum diisi" });
      continue;
    }

    const seo = productSeo(product, identity.city, formatPrice(product.price));
    const onSale =
      product.compare_at_price !== null && product.compare_at_price > product.price;
    const [main, ...others] = photos;

    items += "    <item>\n";
    items += tag("g:id", product.id);
    items += tag("title", clipText(product.name, 150));
    items += tag("description", clipText(product.description?.trim() || seo.description, 4900));
    items += tag("link", absoluteUrl(`/produk/${product.slug}`, base));
    items += tag("g:image_link", absoluteUrl(main, base));
    for (const extra of others.slice(0, 10)) {
      items += tag("g:additional_image_link", absoluteUrl(extra, base));
    }
    items += tag("g:availability", product.stock > 0 ? "in_stock" : "out_of_stock");
    items += tag("g:price", money(onSale ? product.compare_at_price! : product.price));
    if (onSale) items += tag("g:sale_price", money(product.price));
    items += tag("g:condition", "new");
    items += tag("g:brand", product.brand?.trim() || identity.name);
    items += tag("g:identifier_exists", "no");
    items += tag("g:product_type", product.category?.name);
    items += "    </item>\n";
    included++;
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n` +
    `  <channel>\n` +
    `    <title>${xmlEscape(identity.name)}</title>\n` +
    `    <link>${xmlEscape(base)}</link>\n` +
    `    <description>${xmlEscape(clipText(identity.description, 500))}</description>\n` +
    items +
    `  </channel>\n` +
    `</rss>\n`;

  return { xml, included, skipped };
}
