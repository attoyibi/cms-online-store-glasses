import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import {
  SUPABASE_KEY,
  SUPABASE_URL,
  isSupabaseConfigured,
} from "@/lib/supabase/env";

/**
 * Client Supabase untuk Server Component, Route Handler, dan Server Action.
 * `cookies()` bersifat async di Next.js 16.
 */
export async function createClient() {
  if (!isSupabaseConfigured()) return null;

  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Dipanggil dari Server Component — penyegaran sesi sudah
          // ditangani di proxy.ts, jadi aman diabaikan.
        }
      },
    },
  });
}
