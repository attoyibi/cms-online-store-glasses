"use client";

import { useState } from "react";
import { Check } from "lucide-react";

import { LAYOUTS, getLayout } from "@/lib/layouts";
import { cn } from "@/lib/utils";

/**
 * Pemilih tata letak di Admin → Pengaturan. Mengirim dua field tersembunyi
 * (layout_present, layout) yang dibaca `saveSettings`. Dipisah dari palet
 * warna (`ThemePicker`): keduanya bebas dikombinasikan.
 */
export function LayoutPicker({ initialLayout }: { initialLayout: string | null }) {
  const [layoutId, setLayoutId] = useState(getLayout(initialLayout).id);

  return (
    <fieldset className="space-y-4">
      <input type="hidden" name="layout_present" value="1" />
      <input type="hidden" name="layout" value={layoutId} />

      <div className="space-y-1">
        <legend className="text-base font-semibold">Tata letak</legend>
        <p className="text-sm text-muted-foreground">
          Susunan halaman depan dan tampilan header. Setiap tata letak punya
          isi halaman depan sendiri, jadi berpindah tidak menghapus editan di
          tata letak lain.
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label="Tata letak"
        className="grid gap-3 sm:grid-cols-2"
      >
        {LAYOUTS.map((layout) => {
          const selected = layout.id === layoutId;
          return (
            <button
              key={layout.id}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={!layout.available}
              onClick={() => setLayoutId(layout.id)}
              className={cn(
                "relative space-y-3 rounded-xl border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                layout.available
                  ? "hover:bg-muted/50"
                  : "cursor-not-allowed opacity-60",
                selected && "border-primary ring-2 ring-primary/30",
              )}
            >
              <Wireframe kind={layout.id} />
              <span className="flex items-center gap-2 text-sm font-medium">
                {layout.name}
                {!layout.available && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-normal text-muted-foreground">
                    Segera hadir
                  </span>
                )}
              </span>
              <span className="block text-xs text-muted-foreground">
                {layout.description}
              </span>
              {selected && (
                <span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-3" aria-hidden="true" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Sketsa kasar susunan halaman, hanya sebagai gambaran di kartu pilihan */
function Wireframe({ kind }: { kind: string }) {
  const dark = kind === "etalase";
  return (
    <span
      aria-hidden="true"
      className="block space-y-1 overflow-hidden rounded-md border bg-background p-1.5"
    >
      <span
        className={cn(
          "block h-2 rounded-sm",
          dark ? "bg-foreground/80" : "bg-muted-foreground/25",
        )}
      />
      {dark ? (
        <span className="grid grid-cols-2 gap-1 rounded-sm bg-foreground/80 p-1.5">
          <span className="space-y-1">
            <span className="block h-1.5 w-4/5 rounded-sm bg-background/70" />
            <span className="block h-1.5 w-3/5 rounded-sm bg-background/40" />
            <span className="block h-2 w-2/5 rounded-sm bg-primary" />
          </span>
          <span className="block h-8 rounded-sm bg-background/30" />
        </span>
      ) : (
        <span className="grid grid-cols-3 gap-1">
          <span className="col-span-1 block h-10 rounded-sm bg-accent" />
          <span className="col-span-1 block h-10 rounded-sm bg-secondary" />
          <span className="col-span-1 block h-10 rounded-sm bg-accent" />
        </span>
      )}
      <span className="grid grid-cols-4 gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "block h-4 rounded-sm",
              dark ? "bg-card shadow-[0_0_0_1px_var(--border)]" : "bg-muted",
            )}
          />
        ))}
      </span>
    </span>
  );
}
