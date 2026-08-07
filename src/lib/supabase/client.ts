"use client";

import { createBrowserClient } from "@supabase/ssr";

import {
  SUPABASE_KEY,
  SUPABASE_URL,
  isSupabaseConfigured,
} from "@/lib/supabase/env";

/** Client Supabase untuk komponen client. Null bila env belum diisi. */
export function createClient() {
  if (!isSupabaseConfigured()) return null;
  return createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
}
