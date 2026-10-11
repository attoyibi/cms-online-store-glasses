import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ProductCard } from "@/components/product/product-card";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { withDefaults } from "@/lib/blocks/registry";
import type { LensProps } from "@/lib/blocks/types";
import type { Product } from "@/lib/types";

export function LensSection({
  products,
  ...rest
}: { products: Product[] } & Partial<LensProps>) {
  const p = withDefaults("lens", rest);

  return (
    <section className="bg-secondary/60 py-16 sm:py-20">
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <div className="space-y-5">
            {p.eyebrow && (
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                {p.eyebrow}
              </p>
            )}
            <h2 className="text-2xl font-semibold sm:text-3xl">{p.title}</h2>
            {p.body && (
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                {p.body}
              </p>
            )}

            {p.types.length > 0 && (
              <dl className="grid gap-4 pt-2 sm:grid-cols-2">
                {p.types.map((lens, index) => (
                  <div
                    key={`${lens.name}-${index}`}
                    className="rounded-xl border bg-card p-4 shadow-sm"
                  >
                    <dt className="text-sm font-semibold">{lens.name}</dt>
                    <dd className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {lens.body}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              {p.ctaLabel && (
                <WhatsAppButton
                  variant="default"
                  message={p.ctaMessage}
                  label={p.ctaLabel}
                />
              )}
              {p.linkLabel && p.linkHref && (
                <Link
                  href={p.linkHref}
                  className="group inline-flex items-center gap-1.5 self-center rounded-lg px-1 text-sm font-medium transition-colors hover:text-primary"
                >
                  {p.linkLabel}
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              )}
            </div>
          </div>

          {/* content-start agar kartu tidak ikut meregang setinggi kolom teks */}
          {products.length > 0 && (
            <div className="grid content-start grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
