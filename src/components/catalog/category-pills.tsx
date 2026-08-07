import Link from "next/link";

import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CategoryPills({
  categories,
  activeSlug,
}: {
  categories: Category[];
  /** Undefined berarti sedang di halaman "semua produk" */
  activeSlug?: string;
}) {
  return (
    <nav aria-label="Filter kategori" className="snap-row -mx-5 px-5 sm:mx-0 sm:px-0">
      <Link
        href="/produk"
        aria-current={activeSlug ? undefined : "page"}
        className={cn(
          "shrink-0 snap-start rounded-full border px-4 py-2 text-sm transition-colors",
          activeSlug
            ? "bg-card text-muted-foreground hover:text-foreground"
            : "border-primary bg-primary font-medium text-primary-foreground",
        )}
      >
        Semua
      </Link>

      {categories.map((category) => {
        const active = category.slug === activeSlug;
        return (
          <Link
            key={category.id}
            href={`/kategori/${category.slug}`}
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 snap-start whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors",
              active
                ? "border-primary bg-primary font-medium text-primary-foreground"
                : "bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {category.name}
          </Link>
        );
      })}
    </nav>
  );
}
