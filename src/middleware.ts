import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

/**
 * Next.js 16 mengganti nama `middleware.ts` menjadi `proxy.ts`, tapi `proxy`
 * selalu berjalan di runtime Node.js — dan @opennextjs/cloudflare belum
 * mendukungnya (`npm run deploy` gagal dengan "Node.js middleware is not
 * currently supported"). Selama target deploy-nya Cloudflare Workers, file
 * ini tetap memakai nama lama supaya berjalan di edge runtime.
 *
 * Bila nanti adapter Cloudflare sudah mendukung Node middleware, cukup ubah
 * nama file menjadi `proxy.ts` dan nama fungsinya menjadi `proxy`.
 */
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Lewati aset statis dan file gambar — hanya request halaman yang
     * perlu penyegaran sesi.
     */
    "/((?!_next/static|_next/image|favicon.ico|products/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
