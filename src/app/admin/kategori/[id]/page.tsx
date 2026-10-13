import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { deleteCategory } from "@/app/admin/actions";
import { CategoryForm } from "@/components/admin/category-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { getSiteIdentity } from "@/lib/data/queries";
import { requireAdmin } from "@/lib/supabase/admin";
import type { Category } from "@/lib/types";

export default async function EditCategoryPage(
  props: PageProps<"/admin/kategori/[id]">,
) {
  const { id } = await props.params;
  const { supabase } = await requireAdmin();

  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  const category = data as Category | null;
  if (!category) notFound();
  const identity = await getSiteIdentity();

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Link
          href="/admin/kategori"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke daftar
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-semibold">Edit Kategori</h1>

          <form action={deleteCategory}>
            <input type="hidden" name="id" value={category.id} />
            <DeleteButton
              confirmMessage={`Hapus kategori "${category.name}"? Produk di dalamnya tidak ikut terhapus, hanya kehilangan kategorinya.`}
            />
          </form>
        </div>
      </div>

      <CategoryForm
        category={category}
        seoContext={{ siteUrl: identity.siteUrl, storeName: identity.name }}
      />
    </div>
  );
}
