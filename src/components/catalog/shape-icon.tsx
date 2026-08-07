import { cn } from "@/lib/utils";

/**
 * Ikon garis bentuk frame untuk filter visual.
 * viewBox 0 0 72 32 — lebar, karena kacamata memang proporsinya begitu.
 * Semua memakai `currentColor` agar ikut warna tombolnya.
 */
const PATHS: Record<string, React.ReactNode> = {
  bundar: (
    <>
      <circle cx="20" cy="17" r="10.5" />
      <circle cx="52" cy="17" r="10.5" />
      <path d="M30.5 14.5c3-2 8-2 11 0" />
      <path d="M9.5 15 4 11.5M62.5 15 68 11.5" />
    </>
  ),
  kotak: (
    <>
      <rect x="8" y="7" width="24" height="20" rx="4" />
      <rect x="40" y="7" width="24" height="20" rx="4" />
      <path d="M32 13h8" />
      <path d="M8 11 3 8M64 11 69 8" />
    </>
  ),
  "persegi-panjang": (
    <>
      <rect x="6" y="10" width="26" height="14" rx="4" />
      <rect x="40" y="10" width="26" height="14" rx="4" />
      <path d="M32 15h8" />
      <path d="M6 13 2 10M66 13 70 10" />
    </>
  ),
  "cat-eye": (
    <>
      <path d="M6 7c6 2 18 2.5 25 6 .5 8-7 14-14 13C10 25 5 19 6 7Z" />
      <path d="M66 7c-6 2-18 2.5-25 6-.5 8 7 14 14 13 7-1 12-7 11-19Z" />
      <path d="M31 13c3-1.5 7-1.5 10 0" />
      <path d="M6.5 10 2 8M65.5 10 70 8" />
    </>
  ),
  aviator: (
    <>
      <path d="M5 9h27c.5 6-4 17-13 17S5 17 5 9Z" />
      <path d="M67 9H40c-.5 6 4 17 13 17s14-9 14-17Z" />
      <path d="M32 12c2 2.5 6 2.5 8 0" />
      <path d="M5 9h62" />
    </>
  ),
  browline: (
    <>
      <path d="M7 10h26c0 8-5 15-13 15S7 18 7 10Z" />
      <path d="M65 10H39c0 8 5 15 13 15s13-7 13-15Z" />
      <path d="M4 8h64" strokeWidth="3.4" />
      <path d="M33 11c2 1.5 4 1.5 6 0" />
    </>
  ),
};

export function ShapeIcon({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const path = PATHS[slug];
  if (!path) return null;

  return (
    <svg
      viewBox="0 0 72 32"
      className={cn("h-6 w-14", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {path}
    </svg>
  );
}

export function hasShapeIcon(slug: string): boolean {
  return slug in PATHS;
}
