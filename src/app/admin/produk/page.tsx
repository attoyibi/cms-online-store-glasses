import Image from "next/image";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";

import { toggleProductActive } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { requireAdmin } from "@/lib/supabase/admin";
import type { Product } from "@/lib/types";

export default async function AdminProductsPage() {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(id, slug, name)")
    .order("created_at", { ascending: false });

  const products = (data ?? []) as unknown as Product[];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Produk</h1>
          <p className="text-sm text-muted-foreground">
            {products.length} produk terdaftar
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/admin/produk/baru">
            <Plus className="size-4" aria-hidden="true" />
            Tambah Produk
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

      {products.length === 0 ? (
        <p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Belum ada produk. Tambahkan yang pertama, atau jalankan{" "}
          <code className="font-mono">supabase/v3/02_seed.sql</code> untuk
          mengisi data contoh.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <ul className="divide-y">
            {products.map((product) => (
              <li
                key={product.id}
                className="flex flex-wrap items-center gap-4 px-4 py-3"
              >
                <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border bg-muted">
                  {product.images[0] && (
                    <Image
                      src={product.images[0]}
                      alt=""
                      fill
                      sizes="48px"
                      unoptimized
                      className="object-cover"
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{product.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {product.category?.name ?? "Tanpa kategori"} ·{" "}
                    {formatPrice(product.price)} · {product.stock} pcs
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {product.is_featured && (
                    <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium text-accent-foreground">
                      Unggulan
                    </span>
                  )}

                  <form action={toggleProductActive}>
                    <input type="hidden" name="id" value={product.id} />
                    <input
                      type="hidden"
                      name="next"
                      value={String(!product.is_active)}
                    />
                    <button
                      type="submit"
                      className={
                        product.is_active
                          ? "rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary transition-opacity hover:opacity-70"
                          : "rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground transition-opacity hover:opacity-70"
                      }
                    >
                      {product.is_active ? "Aktif" : "Nonaktif"}
                    </button>
                  </form>

                  <Link
                    href={`/admin/produk/${product.id}`}
                    className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label={`Edit ${product.name}`}
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
