import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { SectionHeading } from "@/components/sections/section-heading";
import { withDefaults } from "@/lib/blocks/registry";
import type { CategoryGridProps } from "@/lib/blocks/types";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CategoryGrid({
  categories,
  ...rest
}: { categories: Category[] } & Partial<CategoryGridProps>) {
  const p = withDefaults("category-grid", rest);
  if (categories.length === 0) return null;

  return (
    <section className="container-page py-16 sm:py-20">
      <SectionHeading
        eyebrow={p.eyebrow}
        title={p.title}
        description={p.description}
        action={
          p.actionLabel && p.actionHref
            ? { label: p.actionLabel, href: p.actionHref }
            : undefined
        }
      />

      <div className="mt-9 grid grid-cols-2 gap-3.5 sm:gap-4 lg:grid-cols-3">
        {categories.map((category, index) => (
          <Link
            key={category.id}
            href={`/kategori/${category.slug}`}
            className={cn(
              "group relative overflow-hidden rounded-2xl border bg-card outline-offset-4 transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-ring",
              // Dua kategori pertama dibuat lebih lebar agar grid tidak monoton
              index < 2 && "lg:col-span-1",
            )}
          >
            <div className="relative aspect-[5/4] overflow-hidden bg-muted sm:aspect-[16/10]">
              {category.image_url && (
                <Image
                  src={category.image_url}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 30vw, 45vw"
                  unoptimized={category.image_url.endsWith(".svg")}
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
              )}
            </div>

            <div className="flex items-start justify-between gap-3 p-4">
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-semibold">{category.name}</p>
                {category.description && (
                  <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {category.description}
                  </p>
                )}
              </div>
              <ArrowUpRight
                className="size-4 shrink-0 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                aria-hidden="true"
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
