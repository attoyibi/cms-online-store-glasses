import { AlertTriangle } from "lucide-react";

/**
 * Muncul saat user sudah login tapi belum terdaftar di tabel `admins`.
 *
 * Tanpa ini, gejalanya membingungkan: semua halaman admin terbuka normal
 * (membaca produk lolos lewat cabang `is_active` di policy), tapi setiap
 * simpan dan unggah gambar gagal dengan pesan mentah dari Postgres —
 * "new row violates row-level security policy" — yang tidak menyebut
 * penyebab sebenarnya sama sekali.
 */
export function NotRegisteredNotice({ email }: { email: string }) {
  const sql = `insert into public.admins (user_id, email)
select id, email from auth.users where email = '${email}'
on conflict (user_id) do nothing;`;

  return (
    <div
      role="alert"
      className="mb-6 space-y-3 rounded-xl border border-destructive/40 bg-destructive/5 p-5"
    >
      <p className="flex items-center gap-2 font-semibold text-destructive">
        <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
        Akun ini belum terdaftar sebagai admin
      </p>

      <p className="text-sm leading-relaxed text-muted-foreground">
        Login berhasil, dan halaman-halaman di sini bisa dibuka. Tapi{" "}
        <strong className="text-foreground">
          semua perubahan akan ditolak
        </strong>{" "}
        — menyimpan produk, mengubah pengaturan, dan mengunggah gambar akan
        gagal dengan pesan{" "}
        <em>&ldquo;new row violates row-level security policy&rdquo;</em>.
      </p>

      <p className="text-sm leading-relaxed text-muted-foreground">
        Penyebabnya: aturan keamanan di database hanya mengizinkan menulis
        bagi user yang terdaftar di tabel <code className="font-mono">admins</code>.
        Jalankan SQL ini sekali di{" "}
        <strong className="text-foreground">
          Supabase Dashboard → SQL Editor
        </strong>
        , lalu muat ulang halaman:
      </p>

      <pre className="overflow-x-auto rounded-lg border bg-card p-3 font-mono text-xs leading-relaxed">
        {sql}
      </pre>
    </div>
  );
}
