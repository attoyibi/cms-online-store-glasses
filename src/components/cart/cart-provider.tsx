"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import {
  addItem,
  clearCart,
  getServerSnapshot,
  getSnapshot,
  removeItem,
  setItemQuantity,
  subscribe,
} from "@/lib/cart-store";
import type { CartItem } from "@/lib/types";
import { cartCount, cartTotal } from "@/lib/whatsapp";

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  /** False saat render server & hidrasi pertama — cegah mismatch */
  ready: boolean;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  remove: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

/** True hanya di client; dipakai untuk menunda tampilnya badge jumlah */
const subscribeNoop = () => () => {};
const useIsHydrated = () =>
  useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = useIsHydrated();
  const [isOpen, setOpen] = useState(false);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: cartCount(items),
      total: cartTotal(items),
      ready,
      isOpen,
      setOpen,
      add: addItem,
      remove: removeItem,
      setQuantity: setItemQuantity,
      clear: clearCart,
    }),
    [items, ready, isOpen],
  );

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart harus dipakai di dalam <CartProvider>");
  }
  return context;
}
