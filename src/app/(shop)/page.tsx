import type { Metadata } from "next";

import { BlockRenderer } from "@/components/blocks/block-renderer";
import { getPublishedBlocks } from "@/lib/data/queries";

// Judul dan deskripsi beranda berasal dari layout; di sini hanya penanda alamat resmi
export const metadata: Metadata = { alternates: { canonical: "/" } };

/**
 * Halaman depan dirakit dari daftar blok yang bisa diatur di
 * Admin → Halaman Depan. Sebelum pernah diedit, isinya sama persis dengan
 * susunan semula (lihat `defaultHomeBlocks`).
 */
export default async function HomePage() {
  const blocks = await getPublishedBlocks();
  return <BlockRenderer blocks={blocks} />;
}
