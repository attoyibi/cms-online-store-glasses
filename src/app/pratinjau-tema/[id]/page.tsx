import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ThemePreviewBar } from "@/components/admin/theme-preview-bar";
import { BlockRenderer } from "@/components/blocks/block-renderer";
import { ShopShell } from "@/components/layout/shop-shell";
import { getPublishedBlocks, getStoreSettings } from "@/lib/data/queries";
import { LAYOUTS, getLayout } from "@/lib/layouts";
import { requireAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Pratinjau tema",
  robots: { index: false, follow: false },
};

/**
 * Pratinjau sebuah tema dengan data toko yang sebenarnya, sebelum diaktifkan.
 * Hanya untuk admin yang login. Yang tampil adalah yang akan dilihat
 * pengunjung bila tema ini diaktifkan: halaman depan tema itu yang sudah
 * terbit, atau susunan bawaannya. Palet warna yang sedang berlaku ikut dipakai.
 */
export default async function ThemePreviewPage({
  params,
}: PageProps<"/pratinjau-tema/[id]">) {
  await requireAdmin();

  const { id } = await params;
  const layout = LAYOUTS.find((l) => l.id === id && l.available);
  if (!layout) notFound();

  const [blocks, settings] = await Promise.all([
    getPublishedBlocks(layout.id),
    getStoreSettings(),
  ]);
  const active = getLayout(settings.layout);

  return (
    <ShopShell layoutId={layout.id} analytics={false}>
      <BlockRenderer blocks={blocks} layout={layout.id} />
      <ThemePreviewBar
        layoutId={layout.id}
        layoutName={layout.name}
        activeName={active.name}
        isActive={layout.id === active.id}
      />
    </ShopShell>
  );
}
