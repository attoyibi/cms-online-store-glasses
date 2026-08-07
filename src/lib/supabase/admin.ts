import "server-only";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/**
 * Mengembalikan client Supabase beserta user yang sudah terverifikasi.
 * Dipakai di semua halaman & action admin; melempar redirect bila
 * belum login atau Supabase belum dikonfigurasi.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  if (!supabase) redirect("/admin/login");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  return { supabase, user };
}

/** Versi non-redirect, untuk tempat yang perlu menangani sendiri kegagalan */
export async function getAdminUser() {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}
