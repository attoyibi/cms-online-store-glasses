import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ProductForm } from "@/components/admin/product-form";
import { loadProductFormOptions } from "@/lib/data/admin-queries";
import { getSiteIdentity } from "@/lib/data/queries";

export default async function NewProductPage() {
  const [{ categories, attributes, brands }, identity] = await Promise.all([
    loadProductFormOptions(),
    getSiteIdentity(),
  ]);

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

      <ProductForm
        categories={categories}
        attributes={attributes}
        brands={brands}
        seoContext={{ siteUrl: identity.siteUrl, storeName: identity.name }}
      />
    </div>
  );
}
