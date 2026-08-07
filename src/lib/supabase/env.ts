/**
 * Kredensial Supabase sengaja dibuat opsional. Selama belum diisi,
 * seluruh query jatuh ke data contoh di `lib/data/sample-data.ts`
 * sehingga situs tetap bisa dijalankan dan didemokan.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

/**
 * Supabase mengganti nama kunci publiknya: yang lama `anon key` (JWT
 * panjang), yang baru `publishable key` (berawalan `sb_publishable_`).
 * Keduanya diterima supabase-js dengan cara yang sama, jadi dua-duanya
 * dibaca di sini agar tidak tergantung nama variabel mana yang dipakai.
 */
export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";

export function isSupabaseConfigured(): boolean {
  return SUPABASE_URL.length > 0 && SUPABASE_KEY.length > 0;
}

/**
 * Membedakan "tabelnya belum dibuat" dari "tabelnya kosong".
 *
 * PGRST205 = PostgREST tidak menemukan tabel di schema cache
 * 42P01     = Postgres: relation does not exist
 *
 * Dipakai agar situs bisa kembali ke data contoh ketika kredensial sudah
 * diisi tapi migrasi SQL-nya belum dijalankan — kalau tidak, katalognya
 * tampil kosong tanpa penjelasan.
 */
export function isSchemaMissing(error: { code?: string } | null): boolean {
  return error?.code === "PGRST205" || error?.code === "42P01";
}
