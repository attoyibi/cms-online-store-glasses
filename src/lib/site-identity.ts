import { siteConfig } from "@/lib/site-config";
import type { SeoSettings, StoreSettings } from "@/lib/types";

/**
 * Identitas satu toko dalam bentuk yang siap dipakai: gabungan Pengaturan
 * Toko (nama, WhatsApp, alamat), Pengaturan SEO (kota, alamat situs, data
 * bisnis lokal), dan nilai bawaan dari konfigurasi bila belum diisi.
 *
 * Inilah yang membuat satu kode bisa dijual ke banyak kota: semua yang
 * khas satu toko dibaca dari database toko itu, bukan tertanam di kode.
 */
export type SiteIdentity = {
  name: string;
  city: string;
  region: string;
  tagline: string;
  description: string;
  /** Asal situs tanpa garis miring di akhir, mis. https://toko.com */
  siteUrl: string;
  whatsappNumber: string;
  /** Telepon untuk data terstruktur; bila kosong dipakai nomor WhatsApp */
  phone: string | null;
  email: string | null;
  /** Alamat satu baris dari Pengaturan Toko */
  address: string | null;
  streetAddress: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  openDays: string[];
  opens: string | null;
  closes: string | null;
  openHoursText: string | null;
  priceRange: string | null;
  sameAs: string[];
  ogImage: string | null;
  logo: string | null;
  googleVerification: string | null;
  bingVerification: string | null;
  ga4Id: string | null;
  metaPixelId: string | null;
  noindexSite: boolean;
};

const blank = (value: string | null | undefined): string | null => {
  const text = value?.trim();
  return text ? text : null;
};

/**
 * Rapikan alamat situs menjadi asal (origin) yang valid. Yang tidak valid
 * jatuh ke nilai bawaan, supaya alamat yang salah ketik tidak membuat
 * `new URL()` melempar error dan merusak seluruh situs.
 */
export function normalizeSiteUrl(value: string | null | undefined): string | null {
  const text = value?.trim();
  if (!text) return null;
  try {
    const url = new URL(text);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function buildIdentity(
  store: StoreSettings,
  seo: SeoSettings | null,
): SiteIdentity {
  const siteUrl =
    normalizeSiteUrl(seo?.site_url) ??
    normalizeSiteUrl(siteConfig.url) ??
    "http://localhost:3000";

  return {
    name: store.store_name || siteConfig.name,
    city: blank(seo?.city) ?? siteConfig.city,
    region: blank(seo?.region) ?? "",
    tagline: blank(seo?.tagline) ?? siteConfig.tagline,
    description: blank(seo?.default_description) ?? siteConfig.description,
    siteUrl,
    whatsappNumber: store.whatsapp_number,
    phone: blank(seo?.phone),
    email: blank(store.email),
    address: blank(store.address),
    streetAddress: blank(seo?.street_address),
    postalCode: blank(seo?.postal_code),
    latitude: seo?.latitude ?? null,
    longitude: seo?.longitude ?? null,
    openDays: seo?.open_days ?? [],
    opens: blank(seo?.opens),
    closes: blank(seo?.closes),
    openHoursText: blank(store.open_hours),
    priceRange: blank(seo?.price_range),
    sameAs: [
      ...(seo?.same_as ?? []),
      ...(store.instagram_url && !(seo?.same_as ?? []).includes(store.instagram_url)
        ? [store.instagram_url]
        : []),
    ],
    ogImage: blank(seo?.default_og_image),
    logo: blank(seo?.logo_url),
    googleVerification: blank(seo?.google_verification),
    bingVerification: blank(seo?.bing_verification),
    ga4Id: blank(seo?.ga4_id),
    metaPixelId: blank(seo?.meta_pixel_id),
    noindexSite: seo?.noindex_site === true,
  };
}

// ----------------------------------------------------- penanda {kota}, {toko}

/** Nilai untuk penanda di teks halaman: {toko}, {kota}, {provinsi} */
export type TextVars = { toko: string; kota: string; provinsi: string };

export function textVars(identity: SiteIdentity): TextVars {
  return { toko: identity.name, kota: identity.city, provinsi: identity.region };
}

const PLACEHOLDER = /\{(toko|kota|provinsi)\}/g;

/** Ganti {toko}, {kota}, {provinsi}. Penanda lain (mis. {store}) dibiarkan. */
export function fillVars(text: string, vars: TextVars): string {
  return text.replace(PLACEHOLDER, (_, key: keyof TextVars) => vars[key]);
}

/**
 * Ganti penanda di SEMUA teks dalam sebuah struktur (objek/daftar bersarang).
 * Tidak mengubah struktur aslinya. Dipakai untuk isi blok halaman, supaya
 * teks bawaan seperti "Toko fisik di {kota}" menjadi "Toko fisik di Madiun".
 */
export function resolveVarsDeep<T>(value: T, vars: TextVars): T {
  if (typeof value === "string") return fillVars(value, vars) as T;
  if (Array.isArray(value)) {
    return value.map((item) => resolveVarsDeep(item, vars)) as T;
  }
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      out[key] = resolveVarsDeep(item, vars);
    }
    return out as T;
  }
  return value;
}
