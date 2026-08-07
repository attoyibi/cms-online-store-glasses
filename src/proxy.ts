import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

/**
 * Di Next.js 16 `middleware.ts` berganti nama menjadi `proxy.ts`
 * dan runtime-nya selalu Node.js.
 */
export async function proxy(request: NextRequest) {
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
