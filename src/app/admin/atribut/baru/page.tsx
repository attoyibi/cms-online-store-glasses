import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AttributeForm } from "@/components/admin/attribute-form";
import { requireAdmin } from "@/lib/supabase/admin";
import type { AttributeType } from "@/lib/types";

const VALID_TYPES: AttributeType[] = ["bentuk", "material", "warna"];

export default async function NewAttributePage(
  props: PageProps<"/admin/atribut/baru">,
) {
  await requireAdmin();

  // Jenis bisa diarahkan lewat ?jenis=warna agar tidak perlu memilih ulang
  const searchParams = await props.searchParams;
  const raw = Array.isArray(searchParams.jenis)
    ? searchParams.jenis[0]
    : searchParams.jenis;
  const defaultType = VALID_TYPES.includes(raw as AttributeType)
    ? (raw as AttributeType)
    : "bentuk";

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
        <h1 className="text-2xl font-semibold">Tambah Atribut</h1>
      </div>

      <AttributeForm defaultType={defaultType} />
    </div>
  );
}
