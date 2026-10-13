import { AlertTriangle, ArrowRight, Trash2 } from "lucide-react";

import { deleteRedirect } from "@/app/admin/actions";
import { RedirectForm } from "@/components/admin/redirect-form";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/supabase/admin";
import { isSchemaMissing } from "@/lib/supabase/env";

type Row = { id: string; from_path: string; to_path: string; created_at: string };

export default async function AdminRedirectsPage() {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("seo_redirects")
    .select("*")
    .order("created_at", { ascending: false });

  if (isSchemaMissing(error)) {
    return (
      <p
        role="alert"
        className="flex max-w-3xl items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"
      >
        <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>
          <strong>Tabel pengalihan belum ada.</strong> Jalankan{" "}
          <code className="font-mono">supabase/setup.sql</code> versi terbaru di
          SQL Editor Supabase (aman dijalankan berulang), lalu muat ulang halaman
          ini.
        </span>
      </p>
    );
  }

  const rows = (data ?? []) as Row[];

  return (
    <div className="max-w-3xl space-y-6">
      <p className="text-sm text-muted-foreground">
        Pengalihan permanen dari alamat lama ke alamat baru, supaya tautan
        lama, hasil Google, dan bookmark tidak berujung 404 dan peringkatnya
        ikut pindah. Pengalihan dibuat <strong>otomatis</strong> saat Anda
        mengganti slug produk atau kategori; di sini Anda bisa menambah yang
        lain, mis. dari website lama.
      </p>

      <RedirectForm />

      <section className="space-y-3">
        <h2 className="text-base font-semibold">
          Daftar pengalihan{" "}
          <span className="font-normal text-muted-foreground">({rows.length})</span>
        </h2>

        {rows.length === 0 ? (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            Belum ada pengalihan.
          </p>
        ) : (
          <ul className="divide-y rounded-xl border bg-card">
            {rows.map((row) => (
              <li key={row.id} className="flex items-center gap-3 p-4">
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                  <code className="break-all font-mono">{row.from_path}</code>
                  <ArrowRight
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-label="dialihkan ke"
                  />
                  <code className="break-all font-mono">{row.to_path}</code>
                </div>
                <form action={deleteRedirect}>
                  <input type="hidden" name="id" value={row.id} />
                  <Button type="submit" variant="ghost" size="sm">
                    <Trash2 className="size-4" aria-hidden="true" />
                    <span className="sr-only">Hapus pengalihan {row.from_path}</span>
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-xs text-muted-foreground">
        Pengalihan hanya dipakai saat sebuah alamat tidak ditemukan. Halaman
        yang masih ada, halaman tetap toko (beranda, produk, tentang, cara
        pesan), dan area admin tidak bisa dialihkan. Server menjawab 308 —
        Google memperlakukannya sama dengan 301.
      </p>
    </div>
  );
}
