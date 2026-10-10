import Link from "next/link";

import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { ProductImage } from "@/components/product/product-image";
import { Button } from "@/components/ui/button";
import { discountPercent, formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import { hasVariants, priceRange } from "@/lib/variants";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  priority,
  className,
}: {
  product: Product;
  priority?: boolean;
  className?: string;
}) {
  const discount = discountPercent(product.price, product.compare_at_price);
  const soldOut = product.stock <= 0;
  const withOptions = hasVariants(product);
  const range = priceRange(product);

  return (
    <article className={cn("group relative flex flex-col", className)}>
      <div className="relative overflow-hidden rounded-2xl border bg-muted">
        <div className="relative aspect-4/5">
          <ProductImage
            src={product.images[0]}
            alt={product.name}
            sizes="(min-width: 1280px) 20vw, (min-width: 768px) 30vw, 45vw"
            priority={priority}
            className="transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3">
          {discount ? (
            <span className="rounded-full bg-destructive px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
              -{discount}%
            </span>
          ) : (
            <span />
          )}
          {soldOut && (
            <span className="rounded-full bg-background/95 px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              Stok habis
            </span>
          )}
        </div>

        {/* Tersembunyi sampai hover di layar besar, selalu tampil di layar sentuh.
            z-10 agar tetap bisa diklik di atas stretched link judul. */}
        <div
          className={cn(
            "absolute inset-x-3 bottom-3 z-10 transition-all duration-300",
            "sm:translate-y-3 sm:opacity-0",
            "sm:group-hover:translate-y-0 sm:group-hover:opacity-100",
            "sm:group-focus-within:translate-y-0 sm:group-focus-within:opacity-100",
          )}
        >
          {withOptions ? (
            // Produk bervarian harus memilih ukuran dulu di halaman detail
            <Button asChild size="sm" className="w-full shadow-lg">
              <Link href={`/produk/${product.slug}`}>Pilih Opsi</Link>
            </Button>
          ) : (
            <AddToCartButton
              product={product}
              size="sm"
              className="w-full shadow-lg"
              label="Tambah"
            />
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 pt-3.5">
        {product.brand && (
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {product.brand}
          </p>
        )}

        <h3 className="text-sm font-medium leading-snug">
          {/* Stretched link — seluruh kartu jadi area klik */}
          <Link
            href={`/produk/${product.slug}`}
            className="rounded-sm outline-offset-4 before:absolute before:inset-0 before:content-[''] focus-visible:outline-2 focus-visible:outline-ring"
          >
            {product.name}
          </Link>
        </h3>

        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-0.5 pt-1.5">
          <span className="text-sm font-semibold tabular-nums">
            {withOptions && range.min !== range.max
              ? `${formatPrice(range.min)} – ${formatPrice(range.max)}`
              : formatPrice(range.min)}
          </span>
          {product.compare_at_price && (
            <span className="text-xs text-muted-foreground line-through tabular-nums">
              {formatPrice(product.compare_at_price)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
