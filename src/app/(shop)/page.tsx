import { BlockRenderer } from "@/components/blocks/block-renderer";
import { getPublishedBlocks } from "@/lib/data/queries";

/**
 * Halaman depan dirakit dari daftar blok yang bisa diatur di
 * Admin → Halaman Depan. Sebelum pernah diedit, isinya sama persis dengan
 * susunan semula (lihat `defaultHomeBlocks`).
 */
export default async function HomePage() {
  const blocks = await getPublishedBlocks();
  return <BlockRenderer blocks={blocks} />;
}
