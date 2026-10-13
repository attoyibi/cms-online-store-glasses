import { isAllowedImage } from "@/lib/blocks/normalize";
import type { SeoSettings } from "@/lib/types";

/** Isi form SEO yang sudah dirapikan, siap disimpan (tanpa id). */
export type SeoInput = Omit<SeoSettings, "id">;

/** Nilai mentah dari form: teks, atau banyak teks untuk kotak centang. */
export type RawSeoForm = Record<string, string | string[] | undefined>;

export type SeoParse =
  | { ok: true; value: SeoInput }
  | { ok: false; error: string };

export const DAY_CODES = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] as const;

export const DAY_LABELS: Record<(typeof DAY_CODES)[number], string> = {
  Mo: "Senin",
  Tu: "Selasa",
  We: "Rabu",
  Th: "Kamis",
  Fr: "Jumat",
  Sa: "Sabtu",
  Su: "Minggu",
};

export const MAX_SAME_AS = 8;

const text = (raw: RawSeoForm, key: string): string => {
  const value = raw[key];
  const first = Array.isArray(value) ? value[0] : value;
  return (first ?? "").replace(/\s+/g, " ").trim();
};

const lines = (raw: RawSeoForm, key: string): string[] => {
  const value = raw[key];
  const joined = Array.isArray(value) ? value.join("\n") : (value ?? "");
  return joined
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
};

const isLocalHost = (hostname: string) =>
  hostname === "localhost" ||
  hostname === "127.0.0.1" ||
  hostname === "[::1]" ||
  hostname.endsWith(".localhost");

/**
 * Alamat situs: hanya asal (https://toko.com). Awalan https:// ditambahkan
 * bila lupa diketik, garis miring di akhir dibuang. Path, query, dan
 * fragmen ditolak — alamat salah di sini merusak semua canonical dan sitemap.
 */
export function parseSiteUrl(
  input: string,
): { ok: true; value: string | null } | { ok: false; error: string } {
  const value = input.trim();
  if (!value) return { ok: true, value: null };

  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(value)
    ? value
    : `https://${value}`;

  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    return { ok: false, error: "Alamat situs tidak valid. Contoh: https://tokokacamata.com" };
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return { ok: false, error: "Alamat situs harus diawali https://" };
  }
  if (url.username || url.password) {
    return { ok: false, error: "Alamat situs tidak boleh memuat nama pengguna atau kata sandi." };
  }
  if (url.pathname !== "/" || url.search || url.hash) {
    return {
      ok: false,
      error: "Alamat situs cukup domainnya saja, tanpa path. Contoh: https://tokokacamata.com",
    };
  }
  if (url.protocol === "http:" && !isLocalHost(url.hostname)) {
    return { ok: false, error: "Alamat situs harus memakai https:// (Cloudflare menyediakannya gratis)." };
  }
  if (!url.hostname.includes(".") && !isLocalHost(url.hostname)) {
    return { ok: false, error: "Alamat situs harus berupa domain lengkap, mis. tokokacamata.com" };
  }

  return { ok: true, value: url.origin };
}

/** Kode verifikasi boleh ditempel utuh sebagai tag <meta>; yang diambil isi content-nya. */
export function extractVerificationToken(input: string): string {
  const value = input.trim();
  const fromTag = value.match(/content\s*=\s*["']([^"']+)["']/i);
  return (fromTag ? fromTag[1] : value).trim();
}

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

function parseNumber(value: string): number | null {
  if (!value) return null;
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) ? n : Number.NaN;
}

export function parseSeoForm(raw: RawSeoForm): SeoParse {
  const fail = (error: string): SeoParse => ({ ok: false, error });

  // Alamat situs
  const site = parseSiteUrl(text(raw, "site_url"));
  if (!site.ok) return fail(site.error);

  // Identitas
  const city = text(raw, "city");
  const region = text(raw, "region");
  const tagline = text(raw, "tagline");
  const description = text(raw, "default_description");
  if (city.length > 60) return fail("Nama kota maksimal 60 karakter.");
  if (region.length > 60) return fail("Nama provinsi maksimal 60 karakter.");
  if (tagline.length > 80) return fail("Tagline maksimal 80 karakter.");
  if (description.length > 300) {
    return fail("Deskripsi situs maksimal 300 karakter (idealnya 120–160).");
  }

  // Gambar
  const ogImage = text(raw, "default_og_image");
  const logo = text(raw, "logo_url");
  for (const [label, value] of [
    ["Gambar bagikan", ogImage],
    ["Logo", logo],
  ] as const) {
    if (!value) continue;
    if (!isAllowedImage(value)) {
      return fail(`${label}: pakai gambar yang diunggah lewat panel ini atau file milik situs (diawali /).`);
    }
    if (/\.svg($|\?)/i.test(value)) {
      return fail(`${label}: format SVG tidak dikenali WhatsApp dan Google. Pakai PNG atau JPG.`);
    }
  }

  // Bisnis lokal
  const phone = text(raw, "phone");
  if (phone && !/^\+?[0-9\s().-]{6,20}$/.test(phone)) {
    return fail("Nomor telepon tidak valid. Contoh: 0351 123456 atau +62 812 3456 7890.");
  }
  const street = text(raw, "street_address");
  if (street.length > 200) return fail("Alamat jalan maksimal 200 karakter.");
  const postal = text(raw, "postal_code");
  if (postal && !/^\d{5}$/.test(postal)) {
    return fail("Kode pos harus 5 angka.");
  }

  const latitude = parseNumber(text(raw, "latitude"));
  const longitude = parseNumber(text(raw, "longitude"));
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return fail("Koordinat harus berupa angka, mis. -7.6298 dan 111.5239.");
  }
  if ((latitude === null) !== (longitude === null)) {
    return fail("Isi kedua koordinat (lintang dan bujur), atau kosongkan keduanya.");
  }
  if (latitude !== null && (latitude < -90 || latitude > 90)) {
    return fail("Lintang harus antara -90 dan 90.");
  }
  if (longitude !== null && (longitude < -180 || longitude > 180)) {
    return fail("Bujur harus antara -180 dan 180.");
  }

  // Jam buka
  const rawDays = raw.open_days;
  const dayList = Array.isArray(rawDays) ? rawDays : rawDays ? [rawDays] : [];
  const days = DAY_CODES.filter((code) => dayList.includes(code));
  if (dayList.some((d) => !(DAY_CODES as readonly string[]).includes(d))) {
    return fail("Hari buka tidak dikenali.");
  }
  const opens = text(raw, "opens");
  const closes = text(raw, "closes");
  if ((opens && !TIME.test(opens)) || (closes && !TIME.test(closes))) {
    return fail("Jam harus berformat 24 jam, mis. 09:00 dan 21:00.");
  }
  const hoursFilled = [days.length > 0, !!opens, !!closes];
  if (hoursFilled.some(Boolean) && !hoursFilled.every(Boolean)) {
    return fail("Jam buka: pilih hari, jam buka, dan jam tutup — atau kosongkan ketiganya.");
  }
  if (opens && closes && opens >= closes) {
    return fail("Jam tutup harus setelah jam buka.");
  }

  const priceRange = text(raw, "price_range");
  if (priceRange && !["$", "$$", "$$$"].includes(priceRange)) {
    return fail("Kisaran harga tidak dikenali.");
  }

  // Profil sosial
  const sameAs = [...new Set(lines(raw, "same_as"))];
  if (sameAs.length > MAX_SAME_AS) {
    return fail(`Maksimal ${MAX_SAME_AS} tautan profil.`);
  }
  for (const link of sameAs) {
    let ok = false;
    try {
      const url = new URL(link);
      ok = url.protocol === "https:" && link.length <= 200;
    } catch {
      ok = false;
    }
    if (!ok) return fail(`Tautan profil harus diawali https:// — “${link.slice(0, 40)}” ditolak.`);
  }

  // Verifikasi & pelacakan
  const google = extractVerificationToken(text(raw, "google_verification"));
  const bing = extractVerificationToken(text(raw, "bing_verification"));
  for (const [label, value] of [
    ["Kode Google", google],
    ["Kode Bing", bing],
  ] as const) {
    if (value && !/^[A-Za-z0-9_-]{10,100}$/.test(value)) {
      return fail(`${label} tidak valid. Tempel kode atau seluruh tag <meta> dari situs verifikasinya.`);
    }
  }

  const ga4 = text(raw, "ga4_id").toUpperCase();
  if (ga4 && !/^G-[A-Z0-9]{6,14}$/.test(ga4)) {
    return fail("ID Google Analytics 4 berbentuk G-XXXXXXXXXX.");
  }
  const pixel = text(raw, "meta_pixel_id");
  if (pixel && !/^\d{8,20}$/.test(pixel)) {
    return fail("ID Meta Pixel berupa angka 8–20 digit.");
  }

  const noindex = text(raw, "noindex_site");

  return {
    ok: true,
    value: {
      site_url: site.value,
      city: city || null,
      region: region || null,
      tagline: tagline || null,
      default_description: description || null,
      default_og_image: ogImage || null,
      logo_url: logo || null,
      phone: phone || null,
      street_address: street || null,
      postal_code: postal || null,
      latitude,
      longitude,
      open_days: days,
      opens: opens || null,
      closes: closes || null,
      price_range: priceRange || null,
      same_as: sameAs,
      google_verification: google || null,
      bing_verification: bing || null,
      ga4_id: ga4 || null,
      meta_pixel_id: pixel || null,
      noindex_site: noindex === "on" || noindex === "true",
    },
  };
}
