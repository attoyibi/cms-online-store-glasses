import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Placeholder SVG kita tidak perlu — dan tidak boleh — melewati optimizer
 * gambar Next.js, jadi disajikan apa adanya.
 */
function isVector(src: string) {
  return src.toLowerCase().endsWith(".svg");
}

export function ProductImage({
  src,
  alt,
  sizes,
  priority,
  className,
}: {
  src: string | null | undefined;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          className,
        )}
        aria-label={alt}
        role="img"
      >
        <svg
          viewBox="0 0 64 24"
          className="w-1/2 max-w-24 opacity-40"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="16" cy="12" r="9" />
          <circle cx="48" cy="12" r="9" />
          <path d="M25 10c2-2 12-2 14 0" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={isVector(src)}
      className={cn("object-cover", className)}
    />
  );
}
