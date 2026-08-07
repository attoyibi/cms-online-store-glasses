"use client";

import { ShapeIcon, hasShapeIcon } from "@/components/catalog/shape-icon";
import type { FacetOption } from "@/lib/filters";
import { cn } from "@/lib/utils";

/**
 * Pemilih bentuk frame — filter utama katalog.
 *
 * Sengaja dibuat visual karena inilah cara orang benar-benar memilih
 * kacamata: dilihat bentuknya, bukan dibaca namanya.
 */
export function ShapeFilter({
  options,
  selected,
  onToggle,
}: {
  options: FacetOption[];
  selected: string[];
  onToggle: (slug: string) => void;
}) {
  const drawable = options.filter((option) => hasShapeIcon(option.slug));
  if (drawable.length === 0) return null;

  return (
    <div className="snap-row -mx-5 gap-2.5 px-5 sm:mx-0 sm:flex-wrap sm:px-0">
      {drawable.map((option) => {
        const active = selected.includes(option.slug);
        const empty = option.count === 0 && !active;

        return (
          <button
            key={option.slug}
            type="button"
            onClick={() => onToggle(option.slug)}
            disabled={empty}
            aria-pressed={active}
            className={cn(
              "flex shrink-0 snap-start flex-col items-center gap-1.5 rounded-xl border px-4 py-2.5 transition-colors",
              active
                ? "border-primary bg-primary/8 text-primary"
                : "bg-card text-muted-foreground hover:border-foreground/25 hover:text-foreground",
              empty && "opacity-40 hover:border-border hover:text-muted-foreground",
            )}
          >
            <ShapeIcon slug={option.slug} />
            <span className="whitespace-nowrap text-[11px] font-medium leading-none">
              {option.name}
              <span className="ml-1 font-normal tabular-nums opacity-60">
                {option.count}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
