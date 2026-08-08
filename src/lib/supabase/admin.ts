import "server-only";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/**
 * Apakah user yang sedang login benar-benar terdaftar di tabel `admins`.
 *
 * Login ke Supabase Auth saja TIDAK cukup: seluruh policy RLS menulis
 * memakai `public.is_admin()`, yang hanya true bila `user_id` ada di
 * tabel `admins`. Tanpa pengecekan ini, user yang lupa didaftarkan
 * tetap bisa membuka semua halaman admin (karena membaca produk lolos
 * lewat cabang `is_active`), tapi setiap simpan dan unggah gambar
 * ditolak dengan pesan Postgres mentah yang tidak menjelaskan apa pun.
 */
async function checkRegistered(
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_admin");
  // Fungsinya belum ada berarti migrasi belum dijalankan — biarkan
  // peringatan skema di halaman login yang menjelaskan.
  if (error) return false;
  return data === true;
}

/**
 * Client Supabase + user yang sudah terverifikasi, untuk halaman & action admin.
 * Melempar redirect bila belum login atau Supabase belum dikonfigurasi.
 *
 * Sengaja TIDAK ikut memeriksa keanggotaan tabel `admins` di sini — kalau
 * dilakukan, tiap halaman admin akan memanggil RPC dua kali (sekali dari
 * layout, sekali dari halamannya). Pemeriksaannya cukup sekali di layout,
 * yang menampilkan peringatannya; percobaan tulis yang telanjur lolos tetap
 * ditolak RLS dan pesannya diterjemahkan oleh `describeError`.
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

  if (!user) return null;

  return { user, isRegistered: await checkRegistered(supabase) };
}
