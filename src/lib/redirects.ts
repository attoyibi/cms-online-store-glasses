/** Awalan yang dipakai aplikasi sendiri; tidak boleh dialihkan */
export const RESERVED_PREFIXES = [
  "/admin",
  "/api",
  "/_next",
  "/checkout",
  "/pratinjau",
  "/feed",
] as const;

/** Halaman tetap: selalu menang atas pengalihan, jadi percuma dialihkan */
export const FIXED_PATHS = [
  "/",
  "/produk",
  "/kategori",
  "/tentang",
  "/cara-pesan",
  "/sitemap.xml",
  "/robots.txt",
] as const;

const MAX_FROM = 200;
const MAX_TO = 300;
const MAX_HOPS = 10;

function hasReservedPrefix(path: string): boolean {
  return RESERVED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

/**
 * Rapikan alamat asal: ambil path saja (query dan fragmen dibuang), tanpa
 * garis miring di akhir. Menerima alamat lengkap milik situs sendiri.
 * Mengembalikan null bila bukan alamat situs ini yang valid.
 */
export function normalizeFromPath(
  input: string,
  siteUrl: string,
): string | null {
  const text = input.trim();
  if (!text || /\s/.test(text)) return null;

  let path = text;
  if (/^[a-z][a-z0-9+.-]*:/i.test(text)) {
    try {
      const url = new URL(text);
      if (url.origin !== new URL(siteUrl).origin) return null;
      path = url.pathname;
    } catch {
      return null;
    }
  }

  path = path.split("#")[0].split("?")[0];
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  if (path.length > 1) path = path.replace(/\/+$/, "");
  if (path.length === 0 || path.length > MAX_FROM) return null;
  return path;
}

/**
 * Alamat tujuan: path situs sendiri, boleh memuat query. Alamat lengkap
 * milik situs ini dipangkas jadi path-nya; domain lain ditolak supaya
 * fitur ini tidak bisa dipakai mengalihkan pengunjung ke luar.
 */
export function normalizeToPath(input: string, siteUrl: string): string | null {
  const text = input.trim();
  if (!text || /\s/.test(text)) return null;

  let path = text;
  if (/^[a-z][a-z0-9+.-]*:/i.test(text)) {
    try {
      const url = new URL(text);
      if (url.origin !== new URL(siteUrl).origin) return null;
      path = `${url.pathname}${url.search}`;
    } catch {
      return null;
    }
  }

  path = path.split("#")[0];
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  if (path.length > MAX_TO) return null;
  return path;
}

export type RedirectRule = { from_path: string; to_path: string };

export type RedirectCheck =
  | { ok: true; from: string; to: string }
  | { ok: false; error: string };

/**
 * Periksa satu aturan baru terhadap aturan yang sudah ada: bentuk alamat,
 * alamat bawaan aplikasi, dan putaran (A→B→A atau rantai yang kembali).
 * `existing` boleh memuat aturan dengan alamat asal yang sama; aturan itu
 * dianggap akan digantikan.
 */
export function validateRedirect(
  fromInput: string,
  toInput: string,
  siteUrl: string,
  existing: RedirectRule[],
): RedirectCheck {
  const from = normalizeFromPath(fromInput, siteUrl);
  if (!from) {
    return {
      ok: false,
      error: "Alamat lama tidak valid. Tulis path situs ini, mis. /produk/nama-lama",
    };
  }
  if (from === "/" || (FIXED_PATHS as readonly string[]).includes(from)) {
    return {
      ok: false,
      error: `${from} adalah halaman tetap toko dan selalu tampil, jadi tidak bisa dialihkan.`,
    };
  }
  if (hasReservedPrefix(from)) {
    return { ok: false, error: "Alamat di area admin/sistem tidak bisa dialihkan." };
  }

  const to = normalizeToPath(toInput, siteUrl);
  if (!to) {
    return {
      ok: false,
      error: "Alamat tujuan harus berupa path situs ini (mis. /produk/nama-baru). Alamat domain lain ditolak.",
    };
  }
  if (hasReservedPrefix(to)) {
    return { ok: false, error: "Tujuan tidak boleh di area admin/sistem." };
  }

  const toPath = to.split("?")[0].replace(/(.)\/+$/, "$1");
  if (toPath === from) {
    return { ok: false, error: "Alamat lama dan tujuan sama." };
  }

  // Ikuti rantai dari tujuan; bila kembali ke alamat lama, itu putaran.
  const map = new Map<string, string>();
  for (const rule of existing) {
    if (rule.from_path !== from) {
      map.set(rule.from_path, rule.to_path.split("?")[0].replace(/(.)\/+$/, "$1"));
    }
  }
  let cursor = toPath;
  for (let hop = 0; hop < MAX_HOPS; hop++) {
    if (cursor === from) {
      return {
        ok: false,
        error: "Pengalihan ini membuat putaran tak berujung dengan aturan lain.",
      };
    }
    const next = map.get(cursor);
    if (!next) break;
    cursor = next;
  }
  if (map.has(cursor)) {
    return { ok: false, error: "Rantai pengalihan terlalu panjang." };
  }

  return { ok: true, from, to };
}

/** Alamat produk/kategori untuk pengalihan otomatis saat slug diganti */
export function entityPath(kind: "produk" | "kategori", slug: string): string {
  return `/${kind}/${slug}`;
}
