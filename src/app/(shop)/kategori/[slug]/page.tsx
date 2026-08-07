import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { CatalogToolbar } from "@/components/catalog/catalog-toolbar";
import { CategoryPills } from "@/components/catalog/category-pills";
import { ProductGrid } from "@/components/catalog/product-grid";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getCategories,
  getCategoryBySlug,
  getProducts,
  type ProductSort,
} from "@/lib/data/queries";

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
  const sort = parseSort(searchParams.sort);

  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({ categorySlug: slug, search, sort }),
  ]);

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

        <Suspense fallback={<Skeleton className="h-9 w-full" />}>
          <CatalogToolbar
            basePath={`/kategori/${slug}`}
            total={products.length}
          />
        </Suspense>
      </div>

      <div className="mt-9">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
