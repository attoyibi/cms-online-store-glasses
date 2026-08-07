import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/supabase/admin";
import type { Category } from "@/lib/types";

export default async function NewProductPage() {
  const { supabase } = await requireAdmin();

  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Link
          href="/admin/produk"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke daftar
        </Link>
        <h1 className="text-2xl font-semibold">Tambah Produk</h1>
      </div>

      <ProductForm categories={(data ?? []) as Category[]} />
    </div>
  );
}
