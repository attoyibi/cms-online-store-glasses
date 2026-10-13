import type { Product } from "@/lib/types";

/** Panjang yang masih dibacakan utuh oleh pembaca layar dan dipakai Google Gambar */
export const ALT_MAX = 125;

const squash = (text: string) => text.replace(/\s+/g, " ").trim();

type AltSource = Pick<Product, "name" | "images"> & {
  image_alts?: Record<string, string> | null;
};

/**
 * Teks alternatif foto ke-`index`. Isian admin menang; bila kosong, foto
 * pertama memakai nama produk dan sisanya diberi nomor, supaya tidak ada
 * dua foto dengan teks persis sama.
 */
export function imageAlt(product: AltSource, index: number): string {
  const url = product.images[index];
  const custom = url ? squash(product.image_alts?.[url] ?? "") : "";
  if (custom) return custom;
  return index === 0 ? product.name : `${product.name} — foto ${index + 1}`;
}

/** Teks alternatif semua foto, searah dengan `product.images` */
export function imageAlts(product: AltSource): string[] {
  return product.images.map((_, index) => imageAlt(product, index));
}

export type AltParse =
  | { ok: true; value: Record<string, string> }
  | { ok: false; error: string };

/**
 * Baca isian form (JSON { url: teks }). Hanya foto yang masih ada di daftar
 * yang disimpan, teks kosong dibuang, teks dirapikan dan dibatasi.
 */
export function parseImageAlts(raw: string, images: string[]): AltParse {
  const text = raw.trim();
  if (!text) return { ok: true, value: {} };

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: "Teks alternatif foto tidak terbaca. Muat ulang halaman lalu coba lagi." };
  }
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    return { ok: false, error: "Teks alternatif foto tidak valid." };
  }

  const keep = new Set(images);
  const value: Record<string, string> = {};
  for (const [url, alt] of Object.entries(data as Record<string, unknown>)) {
    if (!keep.has(url) || typeof alt !== "string") continue;
    const clean = squash(alt);
    if (!clean) continue;
    if (clean.length > ALT_MAX) {
      return { ok: false, error: `Teks alternatif foto maksimal ${ALT_MAX} karakter.` };
    }
    value[url] = clean;
  }
  return { ok: true, value };
}
