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

/**
 * Pesan login yang menjelaskan penyebab sebenarnya.
 *
 * Sebelumnya semua kegagalan dijawab "Email atau password salah", padahal
 * Supabase membedakannya: email belum dikonfirmasi, akun diblokir, API key
 * salah, atau koneksi gagal. Tanpa pembedaan itu, admin yang akunnya sudah
 * dibuat manual di dashboard tidak punya petunjuk apa pun.
 *
 * Hanya `invalid_credentials` yang benar-benar berarti email/password salah.
 */
export function describeAuthError(error: {
  message?: string;
  code?: string;
  status?: number;
}): string {
  const message = error.message?.toLowerCase() ?? "";

  switch (error.code) {
    case "invalid_credentials":
      return "Email atau password salah.";
    case "email_not_confirmed":
      return "Email akun ini belum dikonfirmasi. Di Supabase: Authentication → Users → pilih user → Confirm email (atau buat ulang user dengan opsi Auto Confirm).";
    case "user_banned":
      return "Akun ini sedang diblokir di Supabase.";
    case "over_request_rate_limit":
      return "Terlalu banyak percobaan masuk. Tunggu beberapa menit lalu coba lagi.";
  }

  if (error.status === 401 || message.includes("api key")) {
    return "Situs ditolak Supabase (API key tidak valid). Periksa NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY di Build variables, lalu deploy ulang.";
  }

  if (!error.status || error.status >= 500) {
    return "Tidak bisa menghubungi Supabase. Periksa koneksi, atau cek apakah proyek Supabase sedang di-pause.";
  }

  return `Gagal masuk: ${error.message ?? "kesalahan tidak diketahui"}`;
}
