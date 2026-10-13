import type { Category, Product } from "@/lib/types";

/** Batas yang ditegakkan database (setup.sql v8) */
export const SEO_TITLE_MAX = 70;
export const SEO_DESC_MAX = 200;
/** Panjang yang masih ditampilkan utuh oleh Google */
export const SEO_TITLE_GOOD = 60;
export const SEO_DESC_GOOD = 160;
export const SEO_DESC_MIN = 70;

const squash = (text: string) => text.replace(/\s+/g, " ").trim();

/** Potong di batas kata dan beri “…”. Teks yang muat dikembalikan apa adanya. */
export function clipText(text: string, max: number): string {
  const clean = squash(text);
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${base.replace(/[\s,.;:–—-]+$/, "")}…`;
}

export type PageSeo = { title: string; description: string };

/**
 * Judul dan deskripsi satu produk. Isian SEO menang; bila kosong dipakai
 * nama dan deskripsi produk; bila itu pun kosong, kalimat generik berisi
 * nama produk dan kota.
 */
export function productSeo(
  product: Pick<Product, "name" | "brand" | "description" | "seo_title" | "seo_description">,
  city: string,
  priceText: string,
): PageSeo {
  const title = squash(product.seo_title ?? "") || product.name;

  const custom = squash(product.seo_description ?? "");
  if (custom) return { title, description: custom };

  const body = squash(product.description ?? "");
  if (body) return { title, description: clipText(body, 155) };

  const brand = product.brand ? ` ${product.brand}` : "";
  return {
    title,
    description: `${product.name}${brand} — ${priceText}. Pesan lewat WhatsApp, toko kacamata di ${city}.`,
  };
}

export function categorySeo(
  category: Pick<Category, "name" | "description" | "seo_title" | "seo_description">,
  city: string,
): PageSeo {
  const title = squash(category.seo_title ?? "") || category.name;

  const custom = squash(category.seo_description ?? "");
  if (custom) return { title, description: custom };

  const body = squash(category.description ?? "");
  if (body) return { title, description: clipText(body, 155) };

  return {
    title,
    description: `Koleksi ${category.name} pilihan dari toko kacamata di ${city}. Pesan lewat WhatsApp, kirim ke seluruh Indonesia.`,
  };
}

/** Bagaimana judul akan tampil di tab/Google: judul halaman + “| nama toko” */
export function fullTitle(title: string, storeName: string): string {
  return `${title} | ${storeName}`;
}

export type LengthState = "kosong" | "pendek" | "baik" | "panjang";

export function titleState(title: string, storeName: string): LengthState {
  const len = storeName
    ? fullTitle(squash(title), storeName).length
    : squash(title).length;
  if (!squash(title)) return "kosong";
  return len > SEO_TITLE_GOOD ? "panjang" : "baik";
}

export function descriptionState(description: string): LengthState {
  const len = squash(description).length;
  if (len === 0) return "kosong";
  if (len < SEO_DESC_MIN) return "pendek";
  return len > SEO_DESC_GOOD ? "panjang" : "baik";
}
