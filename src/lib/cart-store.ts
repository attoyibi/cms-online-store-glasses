import type { CartItem } from "@/lib/types";

const STORAGE_KEY = "lensara.cart.v1";

/**
 * Keranjang disimpan di localStorage dan diekspos sebagai external store
 * agar bisa dibaca lewat `useSyncExternalStore` — tanpa efek yang
 * memanggil setState saat mount, dan otomatis sinkron antar tab.
 */

const EMPTY: CartItem[] = [];

/** Snapshot harus stabil secara referensi, jadi hasil parse di-cache */
let cache: CartItem[] = EMPTY;
let hydrated = false;

const listeners = new Set<() => void>();

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Partial<CartItem>;
  return (
    typeof item.productId === "string" &&
    typeof item.slug === "string" &&
    typeof item.name === "string" &&
    typeof item.price === "number" &&
    typeof item.quantity === "number"
  );
}

function readStorage(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    // Saring entri rusak agar satu item cacat tidak mengosongkan keranjang
    const valid = parsed.filter(isCartItem);
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

  // Perubahan dari tab lain
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

export function getSnapshot(): CartItem[] {
  if (!hydrated) {
    cache = readStorage();
    hydrated = true;
  }
  return cache;
}

/** Server selalu mengembalikan keranjang kosong — localStorage tidak ada di sana */
export function getServerSnapshot(): CartItem[] {
  return EMPTY;
}

function write(next: CartItem[]) {
  cache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage penuh atau mode privat — keranjang tetap jalan di memori
  }
  emit();
}

export function addItem(item: Omit<CartItem, "quantity">, quantity = 1) {
  const current = getSnapshot();
  const existing = current.find((i) => i.productId === item.productId);

  write(
    existing
      ? current.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + quantity }
            : i,
        )
      : [...current, { ...item, quantity }],
  );
}

export function removeItem(productId: string) {
  write(getSnapshot().filter((i) => i.productId !== productId));
}

export function setItemQuantity(productId: string, quantity: number) {
  const current = getSnapshot();
  write(
    quantity <= 0
      ? current.filter((i) => i.productId !== productId)
      : current.map((i) =>
          i.productId === productId ? { ...i, quantity } : i,
        ),
  );
}

export function clearCart() {
  write(EMPTY);
}
