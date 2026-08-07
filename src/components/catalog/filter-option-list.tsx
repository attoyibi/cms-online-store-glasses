"use client";

import { Checkbox } from "@/components/ui/checkbox";
import type { FacetOption } from "@/lib/filters";
import { cn } from "@/lib/utils";

/**
 * Daftar opsi centang untuk satu dimensi filter.
 * Dipakai ulang di popover desktop dan panel mobile agar keduanya
 * tidak pernah berbeda perilaku.
 */
export function FilterOptionList({
  options,
  selected,
  onToggle,
  idPrefix,
}: {
  options: FacetOption[];
  selected: string[];
  onToggle: (slug: string) => void;
  idPrefix: string;
}) {
  if (options.length === 0) {
    return (
      <p className="px-1 py-2 text-sm text-muted-foreground">
        Belum ada pilihan di kategori ini.
      </p>
    );
  }

  return (
    <ul className="space-y-0.5">
      {options.map((option) => {
        const id = `${idPrefix}-${option.slug}`;
        const active = selected.includes(option.slug);
        const empty = option.count === 0 && !active;

        return (
          <li key={option.slug}>
            <label
              htmlFor={id}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-muted",
                empty && "cursor-not-allowed opacity-45 hover:bg-transparent",
              )}
            >
              <Checkbox
                id={id}
                checked={active}
                disabled={empty}
                onCheckedChange={() => onToggle(option.slug)}
              />

              {option.swatchHex && (
                <span
                  className="size-4 shrink-0 rounded-full border"
                  style={{ backgroundColor: option.swatchHex }}
                  aria-hidden="true"
                />
              )}

              <span className="flex-1 leading-tight">
                {option.name}
                {option.hint && (
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    {option.hint}
                  </span>
                )}
              </span>

              <span className="text-xs text-muted-foreground tabular-nums">
                {option.count}
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
