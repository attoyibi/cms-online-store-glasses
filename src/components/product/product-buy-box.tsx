"use client";

import { useId, useState } from "react";
import { Minus, Plus } from "lucide-react";

import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { discountPercent, formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import { hasVariants, priceRange } from "@/lib/variants";
import { cn } from "@/lib/utils";

/**
 * Harga, pilihan varian, jumlah, dan tombol pesan di halaman detail.
 *
 * Satu komponen karena semuanya bergantung pada varian yang dipilih: harga,
 * stok, batas jumlah, isi keranjang, dan pesan WhatsApp. Pada produk
 * bervarian, pengunjung wajib memilih dulu — tidak ada pilihan bawaan,
 * supaya tidak ada yang memesan ukuran lensa yang salah tanpa sadar.
 */
export function ProductBuyBox({
  product,
  url,
}: {
  product: Product;
  /** URL halaman ini, ikut dikirim di pesan WhatsApp */
  url: string;
}) {
  const withOptions = hasVariants(product);
  const labelId = useId();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const selected = product.variants.find((v) => v.id === selectedId) ?? null;
  const mustChoose = withOptions && !selected;

  const price = selected?.price ?? product.price;
  const compareAt = selected
    ? selected.compare_at_price
    : withOptions
      ? null
      : product.compare_at_price;
  const stock = selected?.stock ?? product.stock;
  const discount = discountPercent(price, compareAt);
  const range = priceRange(product);

  const max = Math.max(stock, 1);
  const safeQuantity = Math.min(quantity, max);

  function choose(id: string) {
    setSelectedId(id);
    setQuantity(1);
  }

  const inquiry =
    `Halo {store}, saya tertarik dengan "${product.name}"` +
    (selected ? ` (${selected.label})` : "") +
    ` (${formatPrice(price)}). Apakah stoknya masih ada?\n${url}`;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="text-2xl font-semibold tabular-nums">
            {mustChoose && range.min !== range.max
              ? `${formatPrice(range.min)} – ${formatPrice(range.max)}`
              : formatPrice(price)}
          </span>
          {compareAt && (
            <span className="text-base text-muted-foreground line-through tabular-nums">
              {formatPrice(compareAt)}
            </span>
          )}
          {discount && <Badge variant="destructive">Hemat {discount}%</Badge>}
        </div>

        <p className="text-sm text-muted-foreground" aria-live="polite">
          {mustChoose ? (
            <>Harga menyesuaikan pilihan Anda.</>
          ) : stock <= 0 ? (
            <span className="text-destructive">
              Stok habis — tanyakan perkiraan restock lewat WhatsApp.
            </span>
          ) : stock <= 5 ? (
            <>Tinggal {stock} pcs</>
          ) : (
            <>Stok tersedia</>
          )}
        </p>
      </div>

      {withOptions && (
        <div className="space-y-2.5">
          <p id={labelId} className="text-sm font-medium">
            Pilih varian
            {selected && (
              <span className="font-normal text-muted-foreground">
                {" "}
                — {selected.label}
              </span>
            )}
          </p>
          <div
            role="radiogroup"
            aria-labelledby={labelId}
            className="grid gap-2 sm:grid-cols-2"
          >
            {product.variants.map((variant) => {
              const active = variant.id === selectedId;
              const soldOut = variant.stock <= 0;
              return (
                <button
                  key={variant.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  disabled={soldOut}
                  onClick={() => choose(variant.id)}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm transition-colors",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    active
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:border-foreground/40",
                    soldOut && "cursor-not-allowed opacity-50",
                  )}
                >
                  <span className="font-medium">{variant.label}</span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {soldOut ? "Habis" : formatPrice(variant.price)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <Separator />

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-xl border">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, safeQuantity - 1))}
              disabled={mustChoose || safeQuantity <= 1}
              className="flex size-11 items-center justify-center rounded-l-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent"
              aria-label="Kurangi jumlah"
            >
              <Minus className="size-4" aria-hidden="true" />
            </button>

            <span
              className="w-10 text-center text-sm font-medium tabular-nums"
              aria-live="polite"
              aria-label={`Jumlah: ${safeQuantity}`}
            >
              {safeQuantity}
            </span>

            <button
              type="button"
              onClick={() => setQuantity(Math.min(max, safeQuantity + 1))}
              disabled={mustChoose || safeQuantity >= max}
              className="flex size-11 items-center justify-center rounded-r-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent"
              aria-label="Tambah jumlah"
            >
              <Plus className="size-4" aria-hidden="true" />
            </button>
          </div>

          {mustChoose ? (
            <Button
              type="button"
              size="lg"
              disabled
              className="flex-1 sm:flex-none"
            >
              Pilih varian dulu
            </Button>
          ) : (
            <AddToCartButton
              product={product}
              option={selected}
              quantity={safeQuantity}
              size="lg"
              openCart
              className="flex-1 sm:flex-none"
            />
          )}
        </div>

        <WhatsAppButton
          size="lg"
          className="w-full sm:w-auto"
          message={inquiry}
          label="Tanya Dulu Lewat WhatsApp"
        />
        <p className="text-xs text-muted-foreground">
          Pembayaran tidak diproses di situs ini. Setelah pesanan masuk, kami
          konfirmasi stok, ongkir, dan cara bayar lewat WhatsApp.
        </p>
      </div>
    </div>
  );
}
