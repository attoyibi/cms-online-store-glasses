import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";

import { LoginForm } from "@/components/admin/login-form";
import { isSchemaReady } from "@/lib/data/queries";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function LoginPage() {
  const configured = isSupabaseConfigured();
  const schemaReady = configured ? await isSchemaReady() : false;

  return (
    <div className="flex flex-1 items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Masuk Admin</h1>
          <p className="text-sm text-muted-foreground">
            Halaman ini hanya untuk pengelola toko.
          </p>
        </div>

        {!configured ? (
          <SetupNotice
            title="Supabase belum dikonfigurasi"
            intro="Situs sedang berjalan dengan data contoh. Untuk mengaktifkan CMS:"
            steps={[
              <>
                Buat proyek di{" "}
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline underline-offset-2"
                >
                  supabase.com
                </a>
              </>,
              <>
                Jalankan <code className="font-mono">supabase/v3/01_schema.sql</code>{" "}
                lalu <code className="font-mono">supabase/v3/02_seed.sql</code> di
                SQL Editor
              </>,
              <>
                Salin URL dan publishable key ke{" "}
                <code className="font-mono">.env.local</code>
              </>,
              <>
                Buat user di Authentication, lalu daftarkan{" "}
                <code className="font-mono">user_id</code>-nya ke tabel{" "}
                <code className="font-mono">admins</code>
              </>,
            ]}
          />
        ) : !schemaReady ? (
          <SetupNotice
            warning
            title="Database masih kosong"
            intro="Kredensial sudah terbaca, tapi tabelnya belum dibuat. Situs publik sementara memakai data contoh. Yang perlu dijalankan di SQL Editor:"
            steps={[
              <>
                <code className="font-mono">supabase/v3/01_schema.sql</code>
              </>,
              <>
                <code className="font-mono">supabase/v3/02_seed.sql</code>{" "}
                <span className="text-muted-foreground">(opsional)</span>
              </>,
            ]}
            footer="Setelah itu buat user di Authentication dan daftarkan ke tabel admins — panduannya ada di supabase/README.md."
          />
        ) : (
          <LoginForm />
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

function SetupNotice({
  title,
  intro,
  steps,
  footer,
  warning,
}: {
  title: string;
  intro: string;
  steps: React.ReactNode[];
  footer?: string;
  warning?: boolean;
}) {
  return (
    <div
      className={
        warning
          ? "space-y-3 rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-sm"
          : "space-y-3 rounded-xl border border-dashed p-5 text-sm"
      }
    >
      <p className="flex items-center gap-2 font-medium">
        {warning && (
          <AlertTriangle
            className="size-4 shrink-0 text-destructive"
            aria-hidden="true"
          />
        )}
        {title}
      </p>
      <p className="leading-relaxed text-muted-foreground">{intro}</p>

      <ol className="list-decimal space-y-1.5 pl-4 leading-relaxed text-muted-foreground">
        {steps.map((step, index) => (
          <li key={index}>{step}</li>
        ))}
      </ol>

      {footer && (
        <p className="leading-relaxed text-muted-foreground">{footer}</p>
      )}
    </div>
  );
}
