import "server-only";

import { permanentRedirect } from "next/navigation";

import { findRedirect } from "@/lib/data/queries";

/**
 * Dipanggil sebelum menjawab 404: bila alamat ini sudah dipindah (aturan di
 * Admin → SEO & Toko → Redirect, atau dibuat otomatis saat slug diganti),
 * alihkan permanen. Tanpa aturan, fungsi ini kembali dan pemanggil lanjut ke
 * notFound().
 *
 * permanentRedirect menjawab 308. Google memperlakukannya sama dengan 301:
 * peringkat dan sinyal halaman lama berpindah ke alamat baru.
 */
export async function redirectIfMoved(path: string): Promise<void> {
  const normalized = path.length > 1 ? path.replace(/\/+$/, "") : path;
  const target = await findRedirect(normalized);
  if (target) permanentRedirect(target);
}
