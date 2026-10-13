import { notFound } from "next/navigation";

import { redirectIfMoved } from "@/lib/redirect-if-moved";
import { RESERVED_PREFIXES } from "@/lib/redirects";

/**
 * Penampung semua alamat yang tidak punya halaman. Halaman yang ada selalu
 * menang atas penampung ini, jadi di sini hanya alamat yang memang akan 404:
 * cek dulu apakah sudah dipindah (Admin → SEO & Toko → Redirect), kalau
 * belum, jawab 404 seperti biasa.
 */
export default async function UnmatchedPage(props: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await props.params;
  const raw = `/${slug.join("/")}`;

  const reserved = RESERVED_PREFIXES.some(
    (prefix) => raw === prefix || raw.startsWith(`${prefix}/`),
  );
  if (!reserved) {
    await redirectIfMoved(raw);

    // Parameter jalur bisa datang dalam bentuk %-encoded; coba bentuk terurai juga
    try {
      const decoded = decodeURI(raw);
      if (decoded !== raw) await redirectIfMoved(decoded);
    } catch {
      // %-encoding rusak: abaikan, lanjut ke 404
    }
  }

  notFound();
}
