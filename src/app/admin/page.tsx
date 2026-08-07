import Link from "next/link";
import { AlertTriangle, ArrowRight, Package, Star, Tags } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { requireAdmin } from "@/lib/supabase/admin";
import type { Product } from "@/lib/types";

export default async function AdminDashboard() {
  const { supabase, user } = await requireAdmin();

  const [products, categories] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, slug, price, stock, is_active, is_featured")
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("id", { count: "exact", head: true }),
  ]);

  const rows = (products.data ?? []) as Pick<
    Product,
    "id" | "name" | "slug" | "price" | "stock" | "is_active" | "is_featured"
  >[];

  const active = rows.filter((p) => p.is_active).length;
  const featured = rows.filter((p) => p.is_featured).length;
  const lowStock = rows.filter((p) => p.stock <= 5);

  const stats = [
    { label: "Produk aktif", value: `${active} / ${rows.length}`, icon: Package },
    { label: "Kategori", value: String(categories.count ?? 0), icon: Tags },
    { label: "Ditandai unggulan", value: String(featured), icon: Star },
  ];

  return (
    <div className="space-y-8">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-semibold">Ringkasan</h1>
        <p className="text-sm text-muted-foreground">
          Masuk sebagai {user.email}
        </p>
      </header>

      {products.error && (
        <p
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          Gagal memuat data: {products.error.message}. Pastikan skema sudah
          dijalankan dan akun Anda terdaftar di tabel{" "}
          <code className="font-mono">admins</code>.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{label}</p>
              <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/admin/produk/baru">Tambah Produk</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/kategori/baru">Tambah Kategori</Link>
        </Button>
      </div>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <AlertTriangle className="size-4 text-muted-foreground" aria-hidden="true" />
          Stok menipis
        </h2>

        {lowStock.length === 0 ? (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            Semua produk stoknya masih di atas 5 pcs.
          </p>
        ) : (
          <ul className="divide-y rounded-xl border bg-card">
            {lowStock.map((product) => (
              <li
                key={product.id}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {formatPrice(product.price)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={
                      product.stock === 0
                        ? "text-sm font-medium text-destructive tabular-nums"
                        : "text-sm tabular-nums"
                    }
                  >
                    {product.stock} pcs
                  </span>
                  <Link
                    href={`/admin/produk/${product.id}`}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={`Edit ${product.name}`}
                  >
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
