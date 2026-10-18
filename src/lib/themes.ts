/**
 * Tema warna toko.
 *
 * Seluruh situs sudah memakai token warna (CSS variables di globals.css),
 * jadi mengganti tema cukup menimpa beberapa token. Tema bawaan ("jade")
 * tidak menimpa apa pun — tampilannya persis seperti globals.css.
 *
 * Yang disimpan di Supabase hanya dua hal (tabel store_settings):
 *   theme         id tema, mis. "navy"
 *   theme_colors  penyesuaian per slot, mis. { "primary": "#1e4f9c" }
 *
 * Menambah tema baru: tambahkan satu entri ke THEMES. Tidak perlu SQL.
 */

export const COLOR_SLOTS = [
  "primary",
  "secondary",
  "accent",
  "background",
  "foreground",
  "ink",
  "announcement",
  "footer",
  "whatsapp",
  "sale",
] as const;

export type ColorSlot = (typeof COLOR_SLOTS)[number];
export type ThemeColors = Partial<Record<ColorSlot, string>>;

type SlotInfo = {
  slot: ColorSlot;
  label: string;
  hint: string;
  group: "umum" | "komponen";
};

/** Urutan & teks di sini yang tampil di Admin → Pengaturan */
export const SLOT_INFO: SlotInfo[] = [
  { slot: "primary", label: "Warna utama", hint: "Tombol, tautan, judul kecil, ikon keranjang", group: "umum" },
  { slot: "secondary", label: "Warna sekunder", hint: "Latar bagian yang lembut (mis. seksi lensa)", group: "umum" },
  { slot: "accent", label: "Warna aksen", hint: "Latar tipis di hero dan menu terpilih", group: "umum" },
  { slot: "background", label: "Latar halaman", hint: "Pilih warna terang agar teks mudah dibaca", group: "umum" },
  { slot: "foreground", label: "Warna teks", hint: "Teks utama di seluruh situs", group: "umum" },
  { slot: "ink", label: "Bagian gelap", hint: "Banner ajakan, strip kepercayaan, dan header tema Etalase", group: "komponen" },
  { slot: "announcement", label: "Bar pengumuman", hint: "Bar tipis di paling atas", group: "komponen" },
  { slot: "footer", label: "Footer", hint: "Bagian paling bawah situs", group: "komponen" },
  { slot: "whatsapp", label: "Tombol WhatsApp", hint: "Tombol mengambang di pojok kanan bawah", group: "komponen" },
  { slot: "sale", label: "Label diskon", hint: "Lencana “-20%” di kartu produk", group: "komponen" },
];

/**
 * Nilai tema bawaan (jade) dalam hex — hanya untuk ditampilkan di pemilih
 * warna. Situs sendiri memakai nilai oklch di globals.css.
 */
export const DEFAULT_COLORS: Record<ColorSlot, string> = {
  primary: "#006e48",
  secondary: "#eff4f0",
  accent: "#e1f3e7",
  background: "#fdfdfb",
  foreground: "#131915",
  ink: "#0c130f",
  announcement: "#0c130f",
  footer: "#0c130f",
  whatsapp: "#33a24e",
  sale: "#e7000b",
};

export type Theme = {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
};

export const DEFAULT_THEME_ID = "jade";

export const THEMES: Theme[] = [
  {
    id: "jade",
    name: "Jade",
    description: "Hijau tenang. Tema utama.",
    colors: {},
  },
  {
    id: "navy",
    name: "Biru Laut",
    description: "Biru tua, rapi dan tepercaya.",
    colors: {
      primary: "#1e4f9c",
      secondary: "#eef3fa",
      accent: "#e1ebf8",
      background: "#fbfcfe",
      foreground: "#14202e",
      ink: "#0f1b2d",
    },
  },
  {
    id: "rose",
    name: "Mawar",
    description: "Merah muda hangat, ramah.",
    colors: {
      primary: "#b0305a",
      secondary: "#fbeff2",
      accent: "#f9e1e8",
      background: "#fffafb",
      foreground: "#2a1519",
      ink: "#2b1218",
    },
  },
  {
    id: "karamel",
    name: "Karamel",
    description: "Cokelat keemasan, klasik.",
    colors: {
      primary: "#9a5410",
      secondary: "#f8f1e6",
      accent: "#f5e6cf",
      background: "#fffcf7",
      foreground: "#2a1f12",
      ink: "#2a1c0e",
    },
  },
  {
    id: "ungu",
    name: "Ungu",
    description: "Ungu modern dan berkarakter.",
    colors: {
      primary: "#6d3fc0",
      secondary: "#f3eefb",
      accent: "#e9e0f8",
      background: "#fcfbff",
      foreground: "#1e1633",
      ink: "#1a1230",
    },
  },
  {
    id: "mono",
    name: "Hitam Putih",
    description: "Netral, minimalis.",
    colors: {
      primary: "#1f1f1f",
      secondary: "#f3f3f3",
      accent: "#e8e8e8",
      background: "#ffffff",
      foreground: "#171717",
      ink: "#111111",
    },
  },
];

const HEX = /^#[0-9a-f]{6}$/i;

export function isHexColor(value: unknown): value is string {
  return typeof value === "string" && HEX.test(value);
}

export function getTheme(id: string | null | undefined): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

/**
 * Bersihkan penyesuaian warna dari input apa pun (form maupun database):
 * hanya slot yang dikenal dan hanya hex #rrggbb. Nilai lain dibuang diam-diam
 * supaya data rusak tidak pernah sampai ke CSS.
 */
export function sanitizeColors(input: unknown): ThemeColors {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  const out: ThemeColors = {};
  for (const slot of COLOR_SLOTS) {
    const value = (input as Record<string, unknown>)[slot];
    if (isHexColor(value)) out[slot] = value.toLowerCase();
  }
  return out;
}

/** Warna efektif satu slot: penyesuaian → tema → bawaan jade */
export function effectiveColor(
  slot: ColorSlot,
  theme: Theme,
  overrides: ThemeColors,
): string {
  const explicit = overrides[slot] ?? theme.colors[slot];
  if (explicit) return explicit;
  // Bar pengumuman & footer mengikuti "Bagian gelap" kecuali diatur sendiri
  if (slot === "announcement" || slot === "footer") {
    return effectiveColor("ink", theme, overrides);
  }
  return DEFAULT_COLORS[slot];
}

// ------------------------------------------------------------ kontras

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  return (
    0.2126 * channel((n >> 16) & 255) +
    0.7152 * channel((n >> 8) & 255) +
    0.0722 * channel(n & 255)
  );
}

/** Rasio kontras WCAG antara dua warna hex (1–21) */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Putih atau hampir-hitam, mana yang lebih terbaca di atas warna ini */
export function readableOn(hex: string): string {
  return contrastRatio(hex, "#ffffff") >= contrastRatio(hex, "#111111")
    ? "#ffffff"
    : "#111111";
}

// ---------------------------------------------------------------- CSS

/**
 * Token CSS yang ditimpa oleh tema + penyesuaian. Kosong untuk tema bawaan
 * tanpa penyesuaian, sehingga situs tampil persis seperti globals.css.
 */
export function themeVars(
  themeId: string | null | undefined,
  colors: unknown,
): Record<string, string> {
  const theme = getTheme(themeId);
  const merged: ThemeColors = { ...theme.colors, ...sanitizeColors(colors) };
  const vars: Record<string, string> = {};

  const { primary, secondary, accent, background, foreground } = merged;
  const { ink, announcement, footer, whatsapp, sale } = merged;

  if (primary) {
    vars["--primary"] = primary;
    vars["--ring"] = primary;
    vars["--brand"] = primary;
    vars["--chart-1"] = primary;
    vars["--primary-foreground"] = readableOn(primary);
    vars["--brand-foreground"] = readableOn(primary);
  }
  if (secondary) vars["--secondary"] = secondary;
  if (accent) {
    vars["--accent"] = accent;
    vars["--brand-soft"] = accent;
    vars["--accent-foreground"] = readableOn(accent);
  }
  if (background) vars["--background"] = background;
  if (foreground) {
    vars["--foreground"] = foreground;
    vars["--card-foreground"] = foreground;
    vars["--popover-foreground"] = foreground;
    vars["--secondary-foreground"] = foreground;
  }
  if (ink) {
    vars["--ink"] = ink;
    vars["--ink-foreground"] = readableOn(ink);
  }
  if (announcement) {
    vars["--announcement"] = announcement;
    vars["--announcement-foreground"] = readableOn(announcement);
  }
  if (footer) {
    vars["--footer"] = footer;
    vars["--footer-foreground"] = readableOn(footer);
  }
  if (whatsapp) vars["--whatsapp"] = whatsapp;
  if (sale) vars["--sale"] = sale;

  return vars;
}

/** CSS siap suntik, atau string kosong bila tidak ada yang berubah */
export function themeCss(
  themeId: string | null | undefined,
  colors: unknown,
): string {
  const entries = Object.entries(themeVars(themeId, colors));
  if (entries.length === 0) return "";
  // `html:root` (bukan `:root`) supaya menang atas globals.css apa pun
  // urutan pemuatannya. Semua nilai sudah tervalidasi hex oleh sanitizeColors.
  return `html:root{${entries.map(([k, v]) => `${k}:${v}`).join(";")}}`;
}
