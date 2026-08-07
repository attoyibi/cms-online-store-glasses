import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { deleteProduct } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/delete-button";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/supabase/admin";
import type { Category, Product } from "@/lib/types";

export default async function EditProductPage(
  props: PageProps<"/admin/produk/[id]">,
) {
  const { id } = await props.params;
  const { supabase } = await requireAdmin();

  const [productResult, categoriesResult] = await Promise.all([
    supabase
      .from("products")
      .select("*, category:categories(id, slug, name)")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("categories").select("*").order("sort_order"),
  ]);

  const product = productResult.data as unknown as Product | null;
  if (!product) notFound();

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

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Edit Produk</h1>
            <Link
              href={`/produk/${product.slug}`}
              target="_blank"
              className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Lihat di situs
            </Link>
          </div>

          <form action={deleteProduct}>
            <input type="hidden" name="id" value={product.id} />
            <DeleteButton
              confirmMessage={`Hapus "${product.name}"? Tindakan ini tidak bisa dibatalkan.`}
            />
          </form>
        </div>
      </div>

      <ProductForm
        categories={(categoriesResult.data ?? []) as Category[]}
        product={product}
      />
    </div>
  );
}
