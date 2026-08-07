"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

import { AddToCartButton } from "@/components/product/add-to-cart-button";
import type { Product } from "@/lib/types";

/**
 * Pemilih jumlah + tombol tambah keranjang untuk halaman detail.
 * Jumlah dibatasi stok agar pesanan yang masuk ke WhatsApp tetap masuk akal.
 */
export function QuantityPicker({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const max = Math.max(product.stock, 1);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center rounded-xl border">
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          disabled={quantity <= 1}
          className="flex size-11 items-center justify-center rounded-l-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent"
          aria-label="Kurangi jumlah"
        >
          <Minus className="size-4" aria-hidden="true" />
        </button>

        <span
          className="w-10 text-center text-sm font-medium tabular-nums"
          aria-live="polite"
          aria-label={`Jumlah: ${quantity}`}
        >
          {quantity}
        </span>

        <button
          type="button"
          onClick={() => setQuantity((q) => Math.min(max, q + 1))}
          disabled={quantity >= max}
          className="flex size-11 items-center justify-center rounded-r-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent"
          aria-label="Tambah jumlah"
        >
          <Plus className="size-4" aria-hidden="true" />
        </button>
      </div>

      <AddToCartButton
        product={product}
        quantity={quantity}
        size="lg"
        openCart
        className="flex-1 sm:flex-none"
      />
    </div>
  );
}
