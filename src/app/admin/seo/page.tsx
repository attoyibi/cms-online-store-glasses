import { AlertTriangle } from "lucide-react";

import { SeoForm } from "@/components/admin/seo-form";
import { getStoreSettings } from "@/lib/data/queries";
import { isSchemaMissing } from "@/lib/supabase/env";
import { requireAdmin } from "@/lib/supabase/admin";
import type { SeoSettings } from "@/lib/types";

export default async function AdminSeoPage() {
  const { supabase } = await requireAdmin();

  const [{ data, error }, store] = await Promise.all([
    supabase.from("seo_settings").select("*").limit(1).maybeSingle(),
    getStoreSettings(),
  ]);

  const tableMissing = isSchemaMissing(error);

  return (
    <>
      {tableMissing ? (
        <p
          role="alert"
          className="flex max-w-3xl items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            <strong>Tabel pengaturan SEO belum ada.</strong> Jalankan{" "}
            <code className="font-mono">supabase/setup.sql</code> versi terbaru
            di SQL Editor Supabase (aman dijalankan berulang), lalu muat ulang
            halaman ini.
          </span>
        </p>
      ) : (
        <SeoForm
          seo={(data as SeoSettings | null) ?? null}
          storeName={store.store_name}
        />
      )}
    </>
  );
}
