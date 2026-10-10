/**
 * Riwayat produk yang terakhir dibuka, disimpan di localStorage perangkat
 * pengunjung (tidak dikirim ke server). Pola yang sama dengan cart-store:
 * external store untuk `useSyncExternalStore`, snapshot di-cache agar stabil.
 */

const STORAGE_KEY = "lensara.recent.v1";
const MAX_ITEMS = 8;

export type RecentItem = {
  slug: string;
  name: string;
  image: string | null;
  /** Harga termurah; sama dengan `priceMax` untuk produk tanpa varian */
  price: number;
  priceMax: number;
};

const EMPTY: RecentItem[] = [];

let cache: RecentItem[] = EMPTY;
let hydrated = false;

const listeners = new Set<() => void>();

function isRecentItem(value: unknown): value is RecentItem {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Partial<RecentItem>;
  return (
    typeof item.slug === "string" &&
    typeof item.name === "string" &&
    typeof item.price === "number" &&
    typeof item.priceMax === "number"
  );
}

function readStorage(): RecentItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    const valid = parsed.filter(isRecentItem).slice(0, MAX_ITEMS);
    return valid.length ? valid : EMPTY;
  } catch {
    return EMPTY;
  }
}

function emit() {
  for (const listener of listeners) listener();
}

export function subscribe(listener: () => void) {
  listeners.add(listener);

  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    cache = readStorage();
    emit();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function getSnapshot(): RecentItem[] {
  if (!hydrated) {
    cache = readStorage();
    hydrated = true;
  }
  return cache;
}

export function getServerSnapshot(): RecentItem[] {
  return EMPTY;
}

/** Catat produk yang baru dibuka; yang sama dipindah ke paling depan */
export function recordView(item: RecentItem) {
  const current = getSnapshot();

  // Sudah di urutan pertama dengan isi yang sama — jangan tulis ulang,
  // supaya komponen yang berlangganan tidak render ulang tanpa perlu.
  const first = current[0];
  if (
    first &&
    first.slug === item.slug &&
    first.name === item.name &&
    first.price === item.price &&
    first.priceMax === item.priceMax &&
    first.image === item.image
  ) {
    return;
  }

  const next = [item, ...current.filter((i) => i.slug !== item.slug)].slice(
    0,
    MAX_ITEMS,
  );
  cache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage penuh atau mode privat — riwayat tetap jalan di memori
  }
  emit();
}
