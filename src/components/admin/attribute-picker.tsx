"use client";

import Link from "next/link";
import { Settings2 } from "lucide-react";

import { ShapeIcon, hasShapeIcon } from "@/components/catalog/shape-icon";
import type { AttributeType, ProductAttribute } from "@/lib/types";
import { cn } from "@/lib/utils";

const GROUPS: { type: AttributeType; label: string; hint: string }[] = [
  {
    type: "bentuk",
    label: "Bentuk",
    hint: "Pilih satu — dipakai filter bentuk di katalog",
  },
  {
    type: "material",
    label: "Material",
    hint: "Boleh lebih dari satu, mis. asetat + metal",
  },
  { type: "warna", label: "Warna", hint: "Boleh lebih dari satu" },
];

/**
 * Kotak centang atribut, dikelompokkan per jenis.
 *
 * Semua memakai nama input yang sama (`attributes`) sehingga terkirim
 * sebagai daftar id — lihat `attributeIds()` di actions.ts.
 */
export function AttributePicker({
  attributes,
  selectedIds,
}: {
  attributes: ProductAttribute[];
  selectedIds: string[];
}) {
  if (attributes.length === 0) {
    return (
      <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
        Belum ada pilihan atribut. Jalankan{" "}
        <code className="font-mono">supabase/v2/</code> lebih dulu, atau
        tambahkan lewat{" "}
        <Link
          href="/admin/atribut"
          className="text-primary underline underline-offset-2"
        >
          halaman Atribut
        </Link>
        .
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {GROUPS.map((group) => {
        const options = attributes
          .filter((attribute) => attribute.type === group.type)
          .sort((a, b) => a.sort_order - b.sort_order);

        if (options.length === 0) return null;

        return (
          <fieldset key={group.type}>
            <legend className="text-sm font-medium">{group.label}</legend>
            <p className="mb-2.5 text-xs text-muted-foreground">{group.hint}</p>

            <div className="flex flex-wrap gap-2">
              {options.map((option) => {
                const checked = selectedIds.includes(option.id);
                return (
                  <label
                    key={option.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                      checked
                        ? "border-primary bg-primary/8 text-primary"
                        : "bg-card hover:border-foreground/25",
                    )}
                  >
                    <input
                      type="checkbox"
                      name="attributes"
                      value={option.id}
                      defaultChecked={checked}
                      className="size-4 rounded border-input accent-primary"
                    />

                    {hasShapeIcon(option.slug) && group.type === "bentuk" && (
                      <ShapeIcon slug={option.slug} className="h-4 w-9" />
                    )}

                    {option.swatch_hex && (
                      <span
                        className="size-4 rounded-full border"
                        style={{ backgroundColor: option.swatch_hex }}
                        aria-hidden="true"
                      />
                    )}

                    {option.name}
                  </label>
                );
              })}
            </div>
          </fieldset>
        );
      })}

      <Link
        href="/admin/atribut"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <Settings2 className="size-3.5" aria-hidden="true" />
        Kelola pilihan atribut
      </Link>
    </div>
  );
}
