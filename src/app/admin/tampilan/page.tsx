import type { Metadata } from "next";
import Link from "next/link";

import { LayoutGallery } from "@/components/admin/layout-gallery";
import { PaletteForm } from "@/components/admin/palette-form";
import { getLayout } from "@/lib/layouts";
import { requireAdmin } from "@/lib/supabase/admin";
import type { StoreSettings } from "@/lib/types";

export const metadata: Metadata = { title: "Tampilan" };

export default async function AppearancePage() {
  const { supabase } = await requireAdmin();

  const { data } = await supabase
    .from("store_settings")
    .select("*")
    .limit(1)
    .maybeSingle();
  const row = data as StoreSettings | null;

  // `select *` memuat kolom baru bila sudah ada, jadi cukup dicek dari barisnya
  const noRow = !row;
  const columnsReady = row ? "layout" in row && "theme" in row : false;
  const disabled = noRow || !columnsReady;

  return (
    <div className="space-y-10">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Tampilan</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Pilih tema untuk situs toko, lalu atur warnanya. Panel admin tidak ikut
          berubah.
        </p>
      </header>

      {noRow && (
        <p className="max-w-2xl rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
          Isi dan simpan dulu{" "}
          <Link href="/admin/pengaturan" className="font-medium underline">
            Pengaturan toko
          </Link>{" "}
          (nama dan nomor WhatsApp), baru tampilan bisa diatur di sini.
        </p>
      )}
      {!noRow && !columnsReady && (
        <p className="max-w-2xl rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
          Fitur tampilan belum aktif. Jalankan{" "}
          <code className="font-mono">supabase/setup.sql</code> versi terbaru di
          SQL Editor Supabase (aman dijalankan berulang), lalu muat ulang halaman
          ini.
        </p>
      )}

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Tema</h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Setiap tema punya isi halaman depan sendiri. Berpindah tema tidak
            menghapus editan di tema lain; produk, kategori, dan pengaturan toko
            dipakai bersama.
          </p>
        </div>
        <LayoutGallery
          activeLayout={getLayout(row?.layout).id}
          disabled={disabled}
        />
      </section>

      <section className="space-y-4 border-t pt-8">
        <PaletteForm
          initialTheme={row?.theme ?? null}
          initialColors={row?.theme_colors ?? {}}
          disabled={disabled}
        />
      </section>
    </div>
  );
}
