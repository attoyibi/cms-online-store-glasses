import Link from "next/link";
import { Pencil, Plus } from "lucide-react";

import { ShapeIcon, hasShapeIcon } from "@/components/catalog/shape-icon";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/supabase/admin";
import type { AttributeType, ProductAttribute } from "@/lib/types";

const GROUPS: { type: AttributeType; label: string; hint: string }[] = [
  {
    type: "bentuk",
    label: "Bentuk Frame",
    hint: "Tampil sebagai tombol bergambar di paling atas filter katalog",
  },
  { type: "material", label: "Material", hint: "Bahan frame" },
  { type: "warna", label: "Warna", hint: "Warna dominan frame" },
];

export default async function AdminAttributesPage() {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("product_attributes")
    .select("*")
    .order("type")
    .order("sort_order");

  const attributes = (data ?? []) as ProductAttribute[];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-lg space-y-1">
          <h1 className="text-2xl font-semibold">Atribut Filter</h1>
          <p className="text-sm text-muted-foreground">
            Pilihan yang muncul di filter katalog. Karena admin memilih dari
            daftar ini — bukan mengetik bebas — filternya tidak akan terisi
            ejaan yang berbeda-beda untuk barang yang sama.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/admin/atribut/baru">
            <Plus className="size-4" aria-hidden="true" />
            Tambah Atribut
          </Link>
        </Button>
      </header>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          Gagal memuat: {error.message}. Kemungkinan{" "}
          <code className="font-mono">supabase/setup.sql</code> belum
          dijalankan.
        </p>
      )}

      {GROUPS.map((group) => {
        const rows = attributes.filter((item) => item.type === group.type);

        return (
          <section key={group.type} className="space-y-2.5">
            <div>
              <h2 className="text-sm font-semibold">{group.label}</h2>
              <p className="text-xs text-muted-foreground">{group.hint}</p>
            </div>

            {rows.length === 0 ? (
              <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                Belum ada pilihan.
              </p>
            ) : (
              <ul className="divide-y overflow-hidden rounded-xl border bg-card">
                {rows.map((attribute) => (
                  <li
                    key={attribute.id}
                    className="flex items-center gap-4 px-4 py-2.5"
                  >
                    <span className="w-6 shrink-0 text-center text-xs text-muted-foreground tabular-nums">
                      {attribute.sort_order}
                    </span>

                    <span className="flex w-14 shrink-0 justify-center text-muted-foreground">
                      {hasShapeIcon(attribute.slug) &&
                      attribute.type === "bentuk" ? (
                        <ShapeIcon slug={attribute.slug} className="h-5 w-11" />
                      ) : attribute.swatch_hex ? (
                        <span
                          className="size-5 rounded-full border"
                          style={{ backgroundColor: attribute.swatch_hex }}
                          aria-hidden="true"
                        />
                      ) : null}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {attribute.name}
                      </p>
                      <p className="truncate font-mono text-xs text-muted-foreground">
                        {attribute.slug}
                      </p>
                    </div>

                    {attribute.is_active === false && (
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                        Nonaktif
                      </span>
                    )}

                    <Link
                      href={`/admin/atribut/${attribute.id}`}
                      className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      aria-label={`Edit ${attribute.name}`}
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
