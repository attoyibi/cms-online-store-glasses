import { AlertTriangle } from "lucide-react";

import { SeoPageForm } from "@/components/admin/seo-page-form";
import { getSiteIdentity } from "@/lib/data/queries";
import { requireAdmin } from "@/lib/supabase/admin";
import { isSchemaMissing } from "@/lib/supabase/env";
import type { SeoPage } from "@/lib/types";

export default async function AdminSeoPagesPage() {
  const { supabase } = await requireAdmin();

  const [{ data, error }, identity] = await Promise.all([
    supabase.from("seo_pages").select("*"),
    getSiteIdentity(),
  ]);

  if (isSchemaMissing(error)) {
    return (
      <p
        role="alert"
        className="flex max-w-3xl items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"
      >
        <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>
          <strong>Tabel SEO halaman belum ada.</strong> Jalankan{" "}
          <code className="font-mono">supabase/setup.sql</code> versi terbaru di
          SQL Editor Supabase (aman dijalankan berulang), lalu muat ulang halaman
          ini.
        </span>
      </p>
    );
  }

  const rows = (data ?? []) as SeoPage[];
  const find = (slug: SeoPage["slug"]) =>
    rows.find((row) => row.slug === slug) ?? null;
  const context = { siteUrl: identity.siteUrl, storeName: identity.name };

  return (
    <div className="max-w-3xl space-y-4">
      <p className="text-sm text-muted-foreground">
        Judul dan deskripsi khusus untuk halaman utama toko. Dikosongkan = teks
        bawaan. SEO tiap produk dan kategori diatur di form produk dan kategori
        masing-masing.
      </p>

      <SeoPageForm
        slug="beranda"
        label="Beranda"
        path="/"
        page={find("beranda")}
        context={context}
        absoluteTitle
        autoTitle={`${identity.name} — ${identity.tagline}`}
        autoDescription={identity.description}
      />
      <SeoPageForm
        slug="produk"
        label="Semua Produk"
        path="/produk"
        page={find("produk")}
        context={context}
        autoTitle="Semua Produk"
        autoDescription="Katalog lengkap frame, sunglasses, dan lensa kacamata. Saring berdasarkan bentuk, harga, material, dan warna. Pesan lewat WhatsApp."
      />
      <SeoPageForm
        slug="tentang"
        label="Tentang Kami"
        path="/tentang"
        page={find("tentang")}
        context={context}
        autoTitle="Tentang Kami"
        autoDescription={`Optik kecil dari ${identity.city} yang menyeleksi sendiri setiap frame sebelum masuk katalog.`}
      />
      <SeoPageForm
        slug="cara-pesan"
        label="Cara Pesan"
        path="/cara-pesan"
        page={find("cara-pesan")}
        context={context}
        autoTitle="Cara Pesan"
        autoDescription="Empat langkah memesan kacamata: pilih produk, kirim ke WhatsApp, konfirmasi pembayaran, lalu barang dikirim."
      />
    </div>
  );
}
