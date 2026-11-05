import Image from "next/image";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/supabase/admin";
import type { Category } from "@/lib/types";

export default async function AdminCategoriesPage() {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  const categories = (data ?? []) as Category[];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Kategori</h1>
          <p className="text-sm text-muted-foreground">
            {categories.length} kategori · urutan menentukan posisi di beranda
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/admin/kategori/baru">
            <Plus className="size-4" aria-hidden="true" />
            Tambah Kategori
          </Link>
        </Button>
      </header>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          Gagal memuat: {error.message}
        </p>
      )}

      {categories.length === 0 ? (
        <p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Belum ada kategori.
        </p>
      ) : (
        <ul className="divide-y overflow-hidden rounded-xl border bg-card">
          {categories.map((category) => (
            <li
              key={category.id}
              className="flex items-center gap-4 px-4 py-3"
            >
              <span className="w-6 shrink-0 text-center text-xs text-muted-foreground tabular-nums">
                {category.sort_order}
              </span>

              <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border bg-muted">
                {category.image_url && (
                  <Image
                    src={category.image_url}
                    alt=""
                    fill
                    sizes="48px"
                    unoptimized
                    className="object-cover"
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{category.name}</p>
                <p className="truncate font-mono text-xs text-muted-foreground">
                  /kategori/{category.slug}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {!category.is_active && (
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                    Nonaktif
                  </span>
                )}
                <Link
                  href={`/admin/kategori/${category.id}`}
                  className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label={`Edit ${category.name}`}
                >
                  <Pencil className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
