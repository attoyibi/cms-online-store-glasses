"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import type { ProductSort } from "@/lib/data/queries";
import { cn } from "@/lib/utils";

const sortOptions: { value: ProductSort; label: string }[] = [
  { value: "terbaru", label: "Terbaru" },
  { value: "termurah", label: "Harga Terendah" },
  { value: "termahal", label: "Harga Tertinggi" },
  { value: "nama", label: "Nama A–Z" },
];

/**
 * Pencarian dan pengurutan disimpan di URL agar hasilnya bisa dibagikan
 * dan tombol back browser tetap berfungsi.
 */
export function CatalogToolbar({
  basePath,
  total,
}: {
  basePath: string;
  total: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get("q") ?? "";
  const currentSort = (searchParams.get("sort") as ProductSort) ?? "terbaru";
  const [draft, setDraft] = useState(currentSearch);

  // Selaraskan input bila URL berubah dari luar (tombol back, klik kategori).
  // Disesuaikan saat render, bukan lewat useEffect, agar tidak ada render ganda.
  const [syncedSearch, setSyncedSearch] = useState(currentSearch);
  if (syncedSearch !== currentSearch) {
    setSyncedSearch(currentSearch);
    setDraft(currentSearch);
  }

  function pushParams(next: { q?: string; sort?: string }) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }

    const query = params.toString();
    startTransition(() => router.push(query ? `${basePath}?${query}` : basePath));
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          pushParams({ q: draft.trim(), sort: currentSort });
        }}
        className="relative w-full sm:max-w-xs"
        role="search"
      >
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Cari frame, merek, atau lensa"
          aria-label="Cari produk"
          className="pl-9 pr-9"
        />
        {draft && (
          <button
            type="button"
            onClick={() => {
              setDraft("");
              pushParams({ q: "", sort: currentSort });
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Hapus pencarian"
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        )}
      </form>

      <div className="flex items-center gap-3">
        <p
          aria-live="polite"
          className="flex items-center gap-1.5 whitespace-nowrap text-sm text-muted-foreground"
        >
          {isPending && (
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          )}
          {total} produk
        </p>

        <label className="sr-only" htmlFor="sort">
          Urutkan
        </label>
        <select
          id="sort"
          value={currentSort}
          onChange={(event) =>
            pushParams({ q: currentSearch, sort: event.target.value })
          }
          className={cn(
            "h-9 rounded-lg border bg-card px-3 text-sm shadow-sm outline-none",
            "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
          )}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
