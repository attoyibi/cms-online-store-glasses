import type { Metadata } from "next";

import { BlockRenderer } from "@/components/blocks/block-renderer";
import { getPublishedBlocks, getSiteIdentity } from "@/lib/data/queries";
import { jsonLdString, localBusinessJsonLd, websiteJsonLd } from "@/lib/seo";

// Judul dan deskripsi beranda berasal dari layout; di sini hanya penanda alamat resmi
export const metadata: Metadata = { alternates: { canonical: "/" } };

/**
 * Halaman depan dirakit dari daftar blok yang bisa diatur di
 * Admin → Halaman Depan. Sebelum pernah diedit, isinya sama persis dengan
 * susunan semula (lihat `defaultHomeBlocks`).
 */
export default async function HomePage() {
  const [blocks, identity] = await Promise.all([
    getPublishedBlocks(),
    getSiteIdentity(),
  ]);
  const business = localBusinessJsonLd(identity);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdString(websiteJsonLd(identity)),
        }}
      />
      {business && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(business) }}
        />
      )}
      <BlockRenderer blocks={blocks} />
    </>
  );
}
