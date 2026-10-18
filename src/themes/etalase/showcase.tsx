import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { ProductShowcaseProps } from "@/lib/blocks/types";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { EtalaseProductCard } from "@/themes/etalase/product-card";

/**
 * Grid produk tema Etalase: judul di tengah, kartu dua kolom di HP dan tiga
 * kolom di layar lebar, tombol ke katalog di bawahnya.
 */
export function EtalaseShowcase({
  props,
  products,
  priority,
}: {
  props: ProductShowcaseProps;
  products: Product[];
  priority: boolean;
}) {
  if (products.length === 0) return null;

  return (
    <section
      className={cn(
        "py-14 sm:py-20",
        props.background === "lembut" && "bg-secondary/60",
      )}
    >
      <div className="container-page">
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          {props.eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              {props.eyebrow}
            </p>
          )}
          <h2 className="text-2xl font-semibold sm:text-3xl">{props.title}</h2>
          {props.description && (
            <p className="text-base leading-relaxed text-muted-foreground">
              {props.description}
            </p>
          )}
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3">
          {products.map((product, index) => (
            <EtalaseProductCard
              key={product.id}
              product={product}
              priority={priority && index < 3}
            />
          ))}
        </div>

        {props.actionLabel && props.actionHref && (
          <div className="mt-10 flex justify-center">
            <Button asChild size="lg" variant="outline">
              <Link href={props.actionHref}>{props.actionLabel}</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
