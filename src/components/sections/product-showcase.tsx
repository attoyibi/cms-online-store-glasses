import { ProductCard } from "@/components/product/product-card";
import { SectionHeading } from "@/components/sections/section-heading";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Deretan produk untuk landing page. Di layar sempit berubah jadi baris
 * yang bisa digeser agar tidak memaksa pengunjung menggulir terlalu panjang.
 */
export function ProductShowcase({
  eyebrow,
  title,
  description,
  action,
  products,
  priority,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: { label: string; href: string };
  products: Product[];
  priority?: boolean;
  className?: string;
}) {
  if (products.length === 0) return null;

  return (
    <section className={cn("container-page py-16 sm:py-20", className)}>
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        description={description}
        action={action}
      />

      <div className="mt-9">
        {/* Mobile: geser horizontal */}
        <div className="snap-row -mx-5 px-5 sm:hidden">
          {products.map((product, index) => (
            <div key={product.id} className="w-44 shrink-0 snap-start">
              <ProductCard product={product} priority={priority && index < 2} />
            </div>
          ))}
        </div>

        {/* Tablet ke atas: grid biasa */}
        <div className="hidden gap-x-5 gap-y-9 sm:grid sm:grid-cols-3 lg:grid-cols-5">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={priority && index < 3}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
