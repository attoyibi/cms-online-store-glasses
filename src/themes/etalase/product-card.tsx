import Link from "next/link";

import { ProductImage } from "@/components/product/product-image";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { discountPercent, formatPrice } from "@/lib/format";
import { imageAlt } from "@/lib/image-alt";
import type { Product } from "@/lib/types";
import { hasVariants, priceRange } from "@/lib/variants";

/**
 * Kartu produk tema Etalase: label kategori, nama, harga, dan tombol
 * "Order via WhatsApp" yang selalu terlihat. Seluruh kartu tetap bisa diklik
 * ke halaman produk (stretched link); tombol WhatsApp berada di atasnya.
 */
export function EtalaseProductCard({
  product,
  priority,
}: {
  product: Product;
  priority?: boolean;
}) {
  const discount = discountPercent(product.price, product.compare_at_price);
  const soldOut = product.stock <= 0;
  const range = priceRange(product);

  return (
    <article className="group relative flex flex-col rounded-2xl border bg-card p-2.5 shadow-sm transition-shadow hover:shadow-md sm:p-3">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
        <ProductImage
          src={product.images[0]}
          alt={imageAlt(product, 0)}
          sizes="(min-width: 1024px) 28vw, (min-width: 640px) 30vw, 46vw"
          priority={priority}
          className="transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {discount ? (
          <span className="absolute left-2 top-2 rounded-full bg-sale px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
            -{discount}%
          </span>
        ) : null}
        {soldOut && (
          <span className="absolute right-2 top-2 rounded-full bg-background/95 px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-sm">
            Stok habis
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 px-0.5 pt-3">
        {product.category && (
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
            {product.category.name}
          </p>
        )}

        <h3 className="line-clamp-2 text-sm font-medium leading-snug">
          <Link
            href={`/produk/${product.slug}`}
            className="rounded-sm outline-offset-4 before:absolute before:inset-0 before:content-[''] focus-visible:outline-2 focus-visible:outline-ring"
          >
            {product.name}
          </Link>
        </h3>

        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-1">
          <span className="text-sm font-semibold tabular-nums">
            {hasVariants(product) && range.min !== range.max
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

      <WhatsAppButton
        size="sm"
        variant="default"
        label="Order via WhatsApp"
        message={`Halo {store}, saya mau pesan ${product.name}. Apakah masih tersedia?`}
        className="relative z-10 mt-3 w-full bg-whatsapp text-white hover:bg-whatsapp/90"
      />
    </article>
  );
}
