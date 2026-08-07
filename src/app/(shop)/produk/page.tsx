import type { Metadata } from "next";
import { Suspense } from "react";

import { CatalogToolbar } from "@/components/catalog/catalog-toolbar";
import { CategoryPills } from "@/components/catalog/category-pills";
import { ProductGrid } from "@/components/catalog/product-grid";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategories, getProducts, type ProductSort } from "@/lib/data/queries";

export const metadata: Metadata = {
  title: "Semua Produk",
  description:
    "Katalog lengkap frame, sunglasses, dan lensa kacamata. Pesan lewat WhatsApp, dikirim ke seluruh Indonesia.",
};

const VALID_SORTS: ProductSort[] = ["terbaru", "termurah", "termahal", "nama"];

function parseSort(value: string | string[] | undefined): ProductSort {
  const candidate = Array.isArray(value) ? value[0] : value;
  return VALID_SORTS.includes(candidate as ProductSort)
    ? (candidate as ProductSort)
    : "terbaru";
}

export default async function ProductsPage(props: PageProps<"/produk">) {
  const searchParams = await props.searchParams;
  const search = Array.isArray(searchParams.q) ? searchParams.q[0] : searchParams.q;
  const sort = parseSort(searchParams.sort);

  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({ search, sort }),
  ]);

  return (
    <div className="container-page py-10 sm:py-14">
      <header className="max-w-2xl space-y-3">
        <h1 className="text-3xl font-semibold sm:text-4xl">Semua Produk</h1>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          {categories.length} kategori, ratusan pilihan. Tambahkan ke keranjang,
          lalu kirim pesanannya ke WhatsApp kami untuk dikonfirmasi.
        </p>
      </header>

      <div className="mt-8 space-y-5">
        <CategoryPills categories={categories} />

        {/* useSearchParams butuh Suspense boundary */}
        <Suspense fallback={<Skeleton className="h-9 w-full" />}>
          <CatalogToolbar basePath="/produk" total={products.length} />
        </Suspense>
      </div>

      <div className="mt-9">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
