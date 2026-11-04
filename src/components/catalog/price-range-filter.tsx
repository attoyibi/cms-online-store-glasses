"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  parsePriceRange,
  priceRangeSlug,
  type PriceBounds,
} from "@/lib/filters";
import { formatPrice } from "@/lib/format";

/**
 * Slider harga dua gagang. Posisi gagang hanya draf; filter baru berlaku
 * setelah tombol "Filter" ditekan, supaya katalog tidak memuat ulang di
 * setiap geseran.
 */
export function PriceRangeFilter({
  bounds,
  selected,
  onApply,
  onClear,
  idPrefix,
}: {
  bounds: PriceBounds;
  /** Nilai "min-maks" dari URL, bila ada */
  selected: string | undefined;
  onApply: (slug: string) => void;
  onClear: () => void;
  idPrefix: string;
}) {
  const applied = parsePriceRange(selected);
  const appliedMin = clamp(applied?.min ?? bounds.min, bounds);
  const appliedMax = clamp(applied?.max ?? bounds.max, bounds);

  const [min, setMin] = useState(appliedMin);
  const [max, setMax] = useState(appliedMax);

  // Selaraskan draf bila filter di URL berubah dari luar (hapus chip, reset)
  const [syncedKey, setSyncedKey] = useState(`${appliedMin}-${appliedMax}`);
  if (syncedKey !== `${appliedMin}-${appliedMax}`) {
    setSyncedKey(`${appliedMin}-${appliedMax}`);
    setMin(appliedMin);
    setMax(appliedMax);
  }

  const span = bounds.max - bounds.min;
  const left = ((min - bounds.min) / span) * 100;
  const right = 100 - ((max - bounds.min) / span) * 100;
  const full = min <= bounds.min && max >= bounds.max;
  const dirty = min !== appliedMin || max !== appliedMax;

  return (
    <div className="space-y-4">
      <div className="price-range relative h-6">
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-muted" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary"
          style={{ left: `${left}%`, right: `${right}%` }}
        />
        <input
          id={`${idPrefix}-min`}
          type="range"
          aria-label="Harga terendah"
          aria-valuetext={formatPrice(min)}
          min={bounds.min}
          max={bounds.max}
          step={bounds.step}
          value={min}
          // Saat dua gagang menumpuk di ujung kanan, yang kiri harus tetap bisa diraih
          style={{ zIndex: min > bounds.max - span / 4 ? 5 : 3 }}
          onChange={(event) =>
            setMin(Math.min(Number(event.target.value), max - bounds.step))
          }
        />
        <input
          id={`${idPrefix}-max`}
          type="range"
          aria-label="Harga tertinggi"
          aria-valuetext={formatPrice(max)}
          min={bounds.min}
          max={bounds.max}
          step={bounds.step}
          value={max}
          style={{ zIndex: 4 }}
          onChange={(event) =>
            setMax(Math.max(Number(event.target.value), min + bounds.step))
          }
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          size="sm"
          className="rounded-full px-5 font-semibold uppercase tracking-wide"
          disabled={!dirty}
          onClick={() =>
            full
              ? onClear()
              : onApply(
                  priceRangeSlug(
                    min > bounds.min ? min : null,
                    max < bounds.max ? max : null,
                  ),
                )
          }
        >
          Filter
        </Button>
        <p className="text-right text-sm tabular-nums text-muted-foreground">
          Harga:{" "}
          <span className="font-semibold text-foreground">{formatPrice(min)}</span>
          {" — "}
          <span className="font-semibold text-foreground">{formatPrice(max)}</span>
        </p>
      </div>

      {applied && (
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
        >
          Hapus filter harga
        </button>
      )}
    </div>
  );
}

function clamp(value: number, bounds: PriceBounds): number {
  return Math.min(Math.max(value, bounds.min), bounds.max);
}
