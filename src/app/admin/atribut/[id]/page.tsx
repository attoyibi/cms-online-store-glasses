import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { deleteAttribute } from "@/app/admin/actions";
import { AttributeForm } from "@/components/admin/attribute-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { requireAdmin } from "@/lib/supabase/admin";
import type { ProductAttribute } from "@/lib/types";

export default async function EditAttributePage(
  props: PageProps<"/admin/atribut/[id]">,
) {
  const { id } = await props.params;
  const { supabase } = await requireAdmin();

  const [attributeResult, usageResult] = await Promise.all([
    supabase.from("product_attributes").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("product_attribute_links")
      .select("product_id", { count: "exact", head: true })
      .eq("attribute_id", id),
  ]);

  const attribute = attributeResult.data as ProductAttribute | null;
  if (!attribute) notFound();

  const usage = usageResult.count ?? 0;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Link
          href="/admin/atribut"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke daftar
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Edit Atribut</h1>
            <p className="text-sm text-muted-foreground">
              {usage === 0
                ? "Belum dipakai produk mana pun."
                : `Dipakai oleh ${usage} produk.`}
            </p>
          </div>

          <form action={deleteAttribute}>
            <input type="hidden" name="id" value={attribute.id} />
            <DeleteButton
              confirmMessage={
                usage === 0
                  ? `Hapus "${attribute.name}"?`
                  : `Hapus "${attribute.name}"? Atribut ini akan dilepas dari ${usage} produk. Produknya sendiri tidak ikut terhapus.`
              }
            />
          </form>
        </div>
      </div>

      <AttributeForm attribute={attribute} />
    </div>
  );
}
