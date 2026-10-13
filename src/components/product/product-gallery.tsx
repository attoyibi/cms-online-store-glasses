"use client";

import { useState } from "react";

import { ProductImage } from "@/components/product/product-image";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  alts,
}: {
  images: string[];
  /** Teks alternatif tiap foto, searah dengan `images` */
  alts: string[];
}) {
  const [active, setActive] = useState(0);
  const current = images[active];

  return (
    <div className="space-y-3">
      <div className="relative aspect-4/5 overflow-hidden rounded-2xl border bg-muted sm:aspect-square">
        <ProductImage
          src={current}
          alt={alts[active] ?? ""}
          sizes="(min-width: 1024px) 45vw, 100vw"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Lihat gambar ${index + 1} dari ${images.length}`}
              aria-current={index === active}
              className={cn(
                "relative size-20 shrink-0 overflow-hidden rounded-xl border-2 bg-muted transition-colors",
                index === active
                  ? "border-primary"
                  : "border-transparent hover:border-border",
              )}
            >
              <ProductImage src={image} alt="" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
