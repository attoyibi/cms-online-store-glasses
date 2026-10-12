/**
 * Ikon yang boleh dipilih di editor blok. Hanya daftar nama — pemetaan ke
 * komponen lucide ada di `components/blocks/icons.ts`, supaya editor di sisi
 * klien tidak ikut memuat semua ikon.
 */
export const ICON_NAMES = [
  "store",
  "package-check",
  "shield-check",
  "headphones",
  "shopping-bag",
  "message-circle",
  "wallet",
  "truck",
  "award",
  "heart",
  "star",
  "clock",
  "map-pin",
  "phone",
  "sparkles",
  "badge-check",
  "gift",
  "glasses",
  "eye",
  "sun",
] as const;

export type IconName = (typeof ICON_NAMES)[number];

export const ICON_LABELS: Record<IconName, string> = {
  store: "Toko",
  "package-check": "Paket",
  "shield-check": "Garansi",
  headphones: "Bantuan",
  "shopping-bag": "Belanja",
  "message-circle": "Chat",
  wallet: "Dompet",
  truck: "Pengiriman",
  award: "Penghargaan",
  heart: "Hati",
  star: "Bintang",
  clock: "Jam",
  "map-pin": "Lokasi",
  phone: "Telepon",
  sparkles: "Kilau",
  "badge-check": "Terverifikasi",
  gift: "Hadiah",
  glasses: "Kacamata",
  eye: "Mata",
  sun: "Matahari",
};
