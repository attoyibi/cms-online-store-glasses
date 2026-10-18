import Image from "next/image";
import Link from "next/link";

import { withDefaults } from "@/lib/blocks/registry";
import type { CategoryGridProps } from "@/lib/blocks/types";
import type { Category } from "@/lib/types";

/**
 * Kategori tema Etalase: judul rata kiri, kartu putih bergambar dengan nama,
 * keterangan singkat, dan tombol "Lihat Produk". Seluruh kartu bisa diklik.
 */
export function EtalaseCategories({
  categories,
  ...rest
}: { categories: Category[] } & Partial<CategoryGridProps>) {
  const p = withDefaults("category-grid", rest);
  if (categories.length === 0) return null;

  return (
    <section className="container-page py-14 sm:py-20">
      <div className="max-w-2xl space-y-3">
        {p.eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            {p.eyebrow}
          </p>
        )}
        <h2 className="text-2xl font-semibold sm:text-3xl">{p.title}</h2>
        {p.description && (
          <p className="text-base leading-relaxed text-muted-foreground">
            {p.description}
          </p>
        )}
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/kategori/${category.slug}`}
            className="group flex flex-col gap-3 rounded-2xl border bg-card p-2.5 text-center shadow-sm outline-offset-4 transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-ring sm:p-3"
          >
            <span className="relative block aspect-square overflow-hidden rounded-xl bg-muted">
              {category.image_url && (
                <Image
                  src={category.image_url}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 28vw, 46vw"
                  unoptimized={category.image_url.endsWith(".svg")}
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
              )}
            </span>

            <span className="block text-sm font-semibold sm:text-base">
              {category.name}
            </span>
            {category.description && (
              <span className="line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                {category.description}
              </span>
            )}

            <span className="mx-auto mb-1 mt-auto inline-flex rounded-full border bg-secondary px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors group-hover:border-primary group-hover:text-primary">
              Lihat Produk
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
