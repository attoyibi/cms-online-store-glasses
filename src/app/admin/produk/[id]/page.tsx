import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { deleteProduct } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/delete-button";
import { ProductForm } from "@/components/admin/product-form";
import { loadProductFormOptions } from "@/lib/data/admin-queries";
import { requireAdmin } from "@/lib/supabase/admin";
import type { Product, ProductAttribute, ProductVariant } from "@/lib/types";

type RawProduct = Omit<Product, "attributes" | "variants"> & {
  links?: { attribute: ProductAttribute | null }[] | null;
  variants?: ProductVariant[] | null;
};

export default async function EditProductPage(
  props: PageProps<"/admin/produk/[id]">,
) {
  const { id } = await props.params;
  const { supabase } = await requireAdmin();

  const withVariants =
    "*, category:categories(id, slug, name), links:product_attribute_links(attribute:product_attributes(*)), variants:product_variants(*)";
  const withAttributes =
    "*, category:categories(id, slug, name), links:product_attribute_links(attribute:product_attributes(*))";

  const load = (select: string) =>
    supabase.from("products").select(select).eq("id", id).maybeSingle();

  // Ulangi tanpa join varian (v4) lalu tanpa atribut (v2) bila belum dijalankan
  let result = await load(withVariants);
  if (result.error) result = await load(withAttributes);
  if (result.error) result = await load("*, category:categories(id, slug, name)");

  const raw = result.data as unknown as RawProduct | null;
  if (!raw) notFound();

  const { links, variants, ...rest } = raw;
  const product: Product = {
    ...rest,
    lens_width_mm: rest.lens_width_mm ?? null,
    variants: [...(variants ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order || a.price - b.price,
    ),
    attributes: (links ?? [])
      .map((link) => link.attribute)
      .filter((a): a is ProductAttribute => Boolean(a)),
  };

  const { categories, attributes, brands } = await loadProductFormOptions();

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
        categories={categories}
        attributes={attributes}
        brands={brands}
        product={product}
      />
    </div>
  );
}
