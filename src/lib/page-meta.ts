import "server-only";

import type { Metadata } from "next";

import { getSeoPage, getSiteIdentity } from "@/lib/data/queries";
import { absoluteUrl } from "@/lib/seo";
import type { SeoPageSlug } from "@/lib/types";

/**
 * Metadata untuk halaman statis (beranda, produk, tentang, cara pesan).
 * Isian dari Admin → SEO & Toko → Halaman menang atas teks bawaan.
 *
 * - `fallback` kosong berarti ikut default layout (dipakai beranda).
 * - `absoluteTitle`: judul tampil apa adanya, tanpa “| nama toko” (beranda).
 * - `hide`: paksa noindex, mis. untuk hasil pencarian.
 */
export async function pageMetadata(
  slug: SeoPageSlug,
  options: {
    fallback?: { title?: string; description?: string };
    canonical?: string | null;
    absoluteTitle?: boolean;
    hide?: boolean;
  } = {},
): Promise<Metadata> {
  const [page, identity] = await Promise.all([
    getSeoPage(slug),
    getSiteIdentity(),
  ]);

  const title = page?.seo_title?.trim() || options.fallback?.title;
  const description =
    page?.seo_description?.trim() || options.fallback?.description;
  const ogImage = page?.og_image
    ? absoluteUrl(page.og_image, identity.siteUrl)
    : undefined;
  const hidden = options.hide === true || page?.noindex === true;

  // Kunci yang tidak punya nilai SENGAJA tidak ditulis. Nilai `undefined`
  // dihitung Next sebagai penggantian, sehingga mis. robots dari layout
  // (termasuk saklar “sembunyikan situs”) ikut terhapus di halaman ini.
  const metadata: Metadata = {};

  if (title) {
    metadata.title = options.absoluteTitle ? { absolute: title } : title;
  }
  if (description) metadata.description = description;
  if (options.canonical && !options.hide) {
    metadata.alternates = { canonical: options.canonical };
  }
  if (hidden) metadata.robots = { index: false, follow: true };

  // openGraph di halaman menggantikan seluruh objek dari layout (bukan
  // digabung), jadi bagian yang tetap harus diulang di sini.
  if (title || description || ogImage) {
    metadata.openGraph = {
      type: "website",
      locale: "id_ID",
      siteName: identity.name,
      title: title ?? `${identity.name} — ${identity.tagline}`,
      description: description ?? identity.description,
      ...(options.canonical ? { url: options.canonical } : {}),
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    };
  }

  return metadata;
}
