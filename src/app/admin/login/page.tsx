import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { LoginForm } from "@/components/admin/login-form";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default function LoginPage() {
  const configured = isSupabaseConfigured();

  return (
    <div className="flex flex-1 items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Masuk Admin</h1>
          <p className="text-sm text-muted-foreground">
            Halaman ini hanya untuk pengelola toko.
          </p>
        </div>

        {configured ? (
          <LoginForm />
        ) : (
          <div className="space-y-3 rounded-xl border border-dashed p-5 text-sm">
            <p className="font-medium">Supabase belum dikonfigurasi</p>
            <p className="leading-relaxed text-muted-foreground">
              Situs sedang berjalan dengan data contoh. Untuk mengaktifkan CMS:
            </p>
            <ol className="list-decimal space-y-1.5 pl-4 leading-relaxed text-muted-foreground">
              <li>
                Buat proyek di{" "}
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline underline-offset-2"
                >
                  supabase.com
                </a>
              </li>
              <li>
                Jalankan isi folder{" "}
                <code className="font-mono">supabase/v1/</code> secara berurutan
                di SQL Editor (01 → 04)
              </li>
              <li>
                Salin URL dan anon key ke{" "}
                <code className="font-mono">.env.local</code>
              </li>
              <li>
                Buat user di Authentication, lalu daftarkan{" "}
                <code className="font-mono">user_id</code>-nya ke tabel{" "}
                <code className="font-mono">admins</code>
              </li>
            </ol>
          </div>
        )}

        <Link
          href="/"
          className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke situs
        </Link>
      </div>
    </div>
  );
}
