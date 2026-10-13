import type { Metadata } from "next";

import { BlockRenderer } from "@/components/blocks/block-renderer";
import { getPublishedBlocks, getSiteIdentity } from "@/lib/data/queries";
import { pageMetadata } from "@/lib/page-meta";
import { jsonLdString, localBusinessJsonLd, websiteJsonLd } from "@/lib/seo";

// Tanpa isian di Admin → SEO & Toko → Halaman, judul dan deskripsi beranda
// berasal dari layout; di sini hanya penanda alamat resmi.
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("beranda", { canonical: "/", absoluteTitle: true });
}

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
