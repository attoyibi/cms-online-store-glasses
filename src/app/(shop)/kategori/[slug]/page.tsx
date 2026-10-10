import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { CategoryPills } from "@/components/catalog/category-pills";
import { EmptyCategory } from "@/components/catalog/empty-category";
import { FilterBar } from "@/components/catalog/filter-bar";
import { ProductGrid } from "@/components/catalog/product-grid";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getCatalog,
  getCategories,
  getCategoryBySlug,
  getRecommendedProducts,
  type ProductSort,
} from "@/lib/data/queries";
import { parseFilters } from "@/lib/filters";

const VALID_SORTS: ProductSort[] = ["terbaru", "termurah", "termahal", "nama"];

function parseSort(value: string | string[] | undefined): ProductSort {
  const candidate = Array.isArray(value) ? value[0] : value;
  return VALID_SORTS.includes(candidate as ProductSort)
    ? (candidate as ProductSort)
    : "terbaru";
}

export async function generateMetadata(
  props: PageProps<"/kategori/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Kategori tidak ditemukan" };

  return {
    title: category.name,
    description:
      category.description ??
      `Koleksi ${category.name} pilihan. Pesan lewat WhatsApp, kirim ke seluruh Indonesia.`,
  };
}

export default async function CategoryPage(
  props: PageProps<"/kategori/[slug]">,
) {
  const [{ slug }, searchParams] = await Promise.all([
    props.params,
    props.searchParams,
  ]);

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const search = Array.isArray(searchParams.q)
    ? searchParams.q[0]
    : searchParams.q;

  const [categories, catalog] = await Promise.all([
    getCategories(),
    getCatalog({
      categorySlug: slug,
      search,
      sort: parseSort(searchParams.sort),
      filters: parseFilters(searchParams),
    }),
  ]);

  // Kategori yang benar-benar kosong — beda dari "ada isi tapi tersaring habis"
  const isEmptyCategory = catalog.totalBeforeFilters === 0 && !search;
  const recommended = isEmptyCategory ? await getRecommendedProducts(8) : [];

  return (
    <div className="container-page py-10 sm:py-14">
      <header className="max-w-2xl space-y-3">
        <h1 className="text-3xl font-semibold sm:text-4xl">{category.name}</h1>
        {category.description && (
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            {category.description}
          </p>
        )}
      </header>

      <div className="mt-8 space-y-5">
        <CategoryPills categories={categories} activeSlug={slug} />

        {!isEmptyCategory && (
          <Suspense fallback={<Skeleton className="h-40 w-full rounded-xl" />}>
            <FilterBar
              basePath={`/kategori/${slug}`}
              facets={catalog.facets}
              total={catalog.products.length}
              totalBeforeFilters={catalog.totalBeforeFilters}
            />
          </Suspense>
        )}
      </div>

      <div className="mt-9">
        {isEmptyCategory ? (
          <EmptyCategory categoryName={category.name} recommended={recommended} />
        ) : (
          <ProductGrid products={catalog.products} />
        )}
      </div>
    </div>
  );
}
