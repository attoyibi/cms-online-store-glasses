"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Loader2, Search, SlidersHorizontal, X } from "lucide-react";

import { FilterOptionList } from "@/components/catalog/filter-option-list";
import { ShapeFilter } from "@/components/catalog/shape-filter";
import { useCatalogFilters } from "@/components/catalog/use-catalog-filters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  FILTER_GROUP_LABEL,
  countActiveFilters,
  hasActiveFilters,
  labelFor,
  type CatalogFilters,
  type Facets,
} from "@/lib/filters";
import type { ProductSort } from "@/lib/data/queries";
import { cn } from "@/lib/utils";

/** Dimensi yang tampil sebagai dropdown; bentuk punya tampilannya sendiri */
const DROPDOWN_GROUPS: (keyof CatalogFilters)[] = [
  "harga",
  "material",
  "warna",
  "ukuran",
  "merek",
];

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "terbaru", label: "Terbaru" },
  { value: "termurah", label: "Harga Terendah" },
  { value: "termahal", label: "Harga Tertinggi" },
  { value: "nama", label: "Nama A–Z" },
];

export function FilterBar({
  basePath,
  facets,
  total,
  totalBeforeFilters,
}: {
  basePath: string;
  facets: Facets;
  total: number;
  totalBeforeFilters: number;
}) {
  const { filters, toggle, clearGroup, clearAll, isPending } =
    useCatalogFilters(basePath);
  const [sheetOpen, setSheetOpen] = useState(false);

  const activeCount = countActiveFilters(filters);
  const anyActive = hasActiveFilters(filters);

  return (
    <div className="space-y-4">
      <SearchAndSort basePath={basePath} />

      <ShapeFilter
        options={facets.bentuk}
        selected={filters.bentuk}
        onToggle={(slug) => toggle("bentuk", slug)}
      />

      <div className="flex flex-wrap items-center gap-2">
        {/* Desktop — tiap dimensi punya dropdown sendiri */}
        <div className="hidden flex-wrap items-center gap-2 md:flex">
          {DROPDOWN_GROUPS.map((group) => (
            <FilterDropdown
              key={group}
              group={group}
              options={facets[group]}
              selected={filters[group]}
              onToggle={(slug) => toggle(group, slug)}
              onClear={() => clearGroup(group)}
            />
          ))}
        </div>

        {/* Mobile — semuanya dikumpulkan di satu panel */}
        <Button
          type="button"
          variant="outline"
          onClick={() => setSheetOpen(true)}
          className="gap-2 md:hidden"
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Filter
          {activeCount > 0 && (
            <span className="rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground tabular-nums">
              {activeCount}
            </span>
          )}
        </Button>

        <p
          aria-live="polite"
          className="ml-auto flex items-center gap-1.5 text-sm text-muted-foreground"
        >
          {isPending && (
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          )}
          {anyActive ? (
            <>
              <span className="font-medium text-foreground tabular-nums">
                {total}
              </span>
              <span className="tabular-nums">dari {totalBeforeFilters} produk</span>
            </>
          ) : (
            <span className="tabular-nums">{total} produk</span>
          )}
        </p>
      </div>

      {anyActive && (
        <ActiveFilterChips
          filters={filters}
          facets={facets}
          onRemove={toggle}
          onClearAll={clearAll}
        />
      )}

      <FilterSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        facets={facets}
        filters={filters}
        onToggle={toggle}
        onClearAll={clearAll}
        total={total}
        activeCount={activeCount}
      />
    </div>
  );
}

// ------------------------------------------------------------- pencarian

function SearchAndSort({ basePath }: { basePath: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("q") ?? "";
  const currentSort = (searchParams.get("sort") as ProductSort) ?? "terbaru";
  const [draft, setDraft] = useState(currentSearch);

  // Selaraskan saat URL berubah dari luar (tombol back, ganti kategori)
  const [syncedSearch, setSyncedSearch] = useState(currentSearch);
  if (syncedSearch !== currentSearch) {
    setSyncedSearch(currentSearch);
    setDraft(currentSearch);
  }

  function pushParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);

    const query = params.toString();
    router.push(query ? `${basePath}?${query}` : basePath, { scroll: false });
  }

  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          pushParam("q", draft.trim());
        }}
        className="relative w-full sm:max-w-xs"
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
              pushParam("q", "");
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Hapus pencarian"
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        )}
      </form>

      <div className="sm:ml-auto">
        <label htmlFor="sort" className="sr-only">
          Urutkan
        </label>
        <select
          id="sort"
          value={currentSort}
          onChange={(event) => pushParam("sort", event.target.value)}
          className="h-9 w-full rounded-lg border bg-card px-3 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:w-auto"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// -------------------------------------------------------------- dropdown

function FilterDropdown({
  group,
  options,
  selected,
  onToggle,
  onClear,
}: {
  group: keyof CatalogFilters;
  options: Facets[keyof CatalogFilters];
  selected: string[];
  onToggle: (slug: string) => void;
  onClear: () => void;
}) {
  if (options.length === 0) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-1.5",
            selected.length > 0 && "border-primary bg-primary/8 text-primary",
          )}
        >
          {FILTER_GROUP_LABEL[group]}
          {selected.length > 0 && (
            <span className="tabular-nums">({selected.length})</span>
          )}
          <ChevronDown className="size-3.5 opacity-60" aria-hidden="true" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-64 p-2">
        <div className="max-h-72 overflow-y-auto">
          <FilterOptionList
            options={options}
            selected={selected}
            onToggle={onToggle}
            idPrefix={`d-${group}`}
          />
        </div>

        {selected.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="mt-1 w-full rounded-lg px-2 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Hapus filter {FILTER_GROUP_LABEL[group].toLowerCase()}
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}

// ------------------------------------------------------------ chip aktif

function ActiveFilterChips({
  filters,
  facets,
  onRemove,
  onClearAll,
}: {
  filters: CatalogFilters;
  facets: Facets;
  onRemove: (key: keyof CatalogFilters, slug: string) => void;
  onClearAll: () => void;
}) {
  const chips = (Object.keys(filters) as (keyof CatalogFilters)[]).flatMap(
    (key) => filters[key].map((slug) => ({ key, slug })),
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map(({ key, slug }) => (
        <button
          key={`${key}-${slug}`}
          type="button"
          onClick={() => onRemove(key, slug)}
          className="group inline-flex items-center gap-1.5 rounded-full border bg-card py-1 pl-3 pr-2 text-xs transition-colors hover:border-destructive/40 hover:text-destructive"
        >
          <span className="text-muted-foreground group-hover:text-destructive">
            {FILTER_GROUP_LABEL[key]}:
          </span>
          <span className="font-medium">{labelFor(key, slug, facets)}</span>
          <X className="size-3" aria-hidden="true" />
          <span className="sr-only">Hapus filter ini</span>
        </button>
      ))}

      <button
        type="button"
        onClick={onClearAll}
        className="rounded-full px-2.5 py-1 text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
      >
        Hapus semua
      </button>
    </div>
  );
}

// --------------------------------------------------------- panel mobile

function FilterSheet({
  open,
  onOpenChange,
  facets,
  filters,
  onToggle,
  onClearAll,
  total,
  activeCount,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facets: Facets;
  filters: CatalogFilters;
  onToggle: (key: keyof CatalogFilters, slug: string) => void;
  onClearAll: () => void;
  total: number;
  activeCount: number;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="flex max-h-[85dvh] flex-col gap-0 rounded-t-2xl p-0"
      >
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="text-base">
            Filter{activeCount > 0 && ` (${activeCount})`}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Saring produk berdasarkan harga, material, warna, ukuran, dan merek
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 divide-y overflow-y-auto px-5">
          {DROPDOWN_GROUPS.map((group) =>
            facets[group].length === 0 ? null : (
              <section key={group} className="py-4">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {FILTER_GROUP_LABEL[group]}
                </h3>
                <FilterOptionList
                  options={facets[group]}
                  selected={filters[group]}
                  onToggle={(slug) => onToggle(group, slug)}
                  idPrefix={`m-${group}`}
                />
              </section>
            ),
          )}
        </div>

        <SheetFooter className="flex-row gap-3 border-t px-5 py-4">
          <Button
            variant="outline"
            onClick={onClearAll}
            disabled={activeCount === 0}
            className="flex-1"
          >
            Reset
          </Button>
          <Button onClick={() => onOpenChange(false)} className="flex-1">
            Lihat {total} produk
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
