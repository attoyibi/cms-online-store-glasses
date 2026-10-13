import type { Metadata } from "next";
import { Suspense } from "react";

import { CategoryPills } from "@/components/catalog/category-pills";
import { FilterBar } from "@/components/catalog/filter-bar";
import { ProductGrid } from "@/components/catalog/product-grid";
import { Skeleton } from "@/components/ui/skeleton";
import { getCatalog, getCategories, type ProductSort } from "@/lib/data/queries";
import { parseFilters } from "@/lib/filters";

/**
 * Urutan dan filter (?sort=, ?harga=, dst.) hanyalah tampilan lain dari daftar
 * yang sama, jadi canonical-nya tetap /produk. Hasil PENCARIAN (?q=) berbeda:
 * isinya tipis dan tak terbatas jumlahnya, jadi tidak diindeks (tetap diikuti
 * tautannya).
 */
export async function generateMetadata(
  props: PageProps<"/produk">,
): Promise<Metadata> {
  const { q } = await props.searchParams;
  const searching = Boolean(Array.isArray(q) ? q[0] : q);

  return {
    title: "Semua Produk",
    description:
      "Katalog lengkap frame, sunglasses, dan lensa kacamata. Saring berdasarkan bentuk, harga, material, dan warna. Pesan lewat WhatsApp.",
    alternates: searching ? undefined : { canonical: "/produk" },
    robots: searching ? { index: false, follow: true } : undefined,
  };
}

const VALID_SORTS: ProductSort[] = ["terbaru", "termurah", "termahal", "nama"];

function parseSort(value: string | string[] | undefined): ProductSort {
  const candidate = Array.isArray(value) ? value[0] : value;
  return VALID_SORTS.includes(candidate as ProductSort)
    ? (candidate as ProductSort)
    : "terbaru";
}

export default async function ProductsPage(props: PageProps<"/produk">) {
  const searchParams = await props.searchParams;
  const search = Array.isArray(searchParams.q)
    ? searchParams.q[0]
    : searchParams.q;

  const [categories, catalog] = await Promise.all([
    getCategories(),
    getCatalog({
      search,
      sort: parseSort(searchParams.sort),
      filters: parseFilters(searchParams),
    }),
  ]);

  return (
    <div className="container-page py-10 sm:py-14">
      <header className="max-w-2xl space-y-3">
        <h1 className="text-3xl font-semibold sm:text-4xl">Semua Produk</h1>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          {categories.length} kategori, ratusan pilihan. Saring dulu sesuai
          selera, lalu kirim pesanannya ke WhatsApp kami untuk dikonfirmasi.
        </p>
      </header>

      <div className="mt-8 space-y-5">
        <CategoryPills categories={categories} />

        {/* useSearchParams butuh Suspense boundary */}
        <Suspense fallback={<Skeleton className="h-40 w-full rounded-xl" />}>
          <FilterBar
            basePath="/produk"
            facets={catalog.facets}
            total={catalog.products.length}
            totalBeforeFilters={catalog.totalBeforeFilters}
          />
        </Suspense>
      </div>

      <div className="mt-9">
        <ProductGrid products={catalog.products} />
      </div>
    </div>
  );
}
