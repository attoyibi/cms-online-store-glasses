import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CategoryForm } from "@/components/admin/category-form";
import { requireAdmin } from "@/lib/supabase/admin";

export default async function NewCategoryPage() {
  await requireAdmin();

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
        <h1 className="text-2xl font-semibold">Tambah Kategori</h1>
      </div>

      <CategoryForm />
    </div>
  );
}
