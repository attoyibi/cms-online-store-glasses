/**
 * Menerjemahkan penolakan Row Level Security menjadi pesan yang menjelaskan
 * penyebabnya.
 *
 * Postgres membalas dengan "new row violates row-level security policy" —
 * benar secara teknis, tapi tidak menyebut apa yang sebenarnya salah. Di
 * aplikasi ini penyebabnya hampir selalu satu hal: akun yang login belum
 * didaftarkan ke tabel `admins`, sehingga `public.is_admin()` bernilai false
 * dan semua policy tulis menolaknya.
 */
const RLS_HINT =
  "Akun Anda belum terdaftar sebagai admin di database, jadi semua perubahan ditolak. Lihat peringatan merah di bagian atas halaman untuk perintah SQL yang perlu dijalankan.";

/** Kode & pesan yang menandakan penolakan RLS, dari PostgREST maupun Storage */
function isRlsRejection(error: { message?: string; code?: string }): boolean {
  const message = error.message?.toLowerCase() ?? "";
  return (
    error.code === "42501" ||
    message.includes("row-level security") ||
    message.includes("row level security")
  );
}

/** Pesan siap tampil untuk error dari PostgREST atau Supabase Storage */
export function describeError(
  error: { message?: string; code?: string } | null,
  fallbackPrefix = "Gagal menyimpan",
): string {
  if (!error) return `${fallbackPrefix}.`;
  if (isRlsRejection(error)) return RLS_HINT;
  return `${fallbackPrefix}: ${error.message ?? "kesalahan tidak diketahui"}`;
}
