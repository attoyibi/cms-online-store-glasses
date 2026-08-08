import type { NextConfig } from "next";

/**
 * Peringatkan bila variabel Supabase tidak ada saat build produksi.
 *
 * Tanpa ini, salah menaruh variabel tidak menimbulkan gejala apa pun saat
 * deploy: build tetap "Success", situs tetap terbuka, hanya isinya diam-diam
 * data contoh. Penyebab tersering adalah variabel diisi di
 * Settings → Variables & Secrets (runtime) padahal NEXT_PUBLIC_* dibaca
 * saat build, yang tempatnya di Settings → Build → Build variables.
 *
 * Sengaja hanya memperingatkan, bukan menggagalkan build — situs ini memang
 * dirancang tetap bisa dideploy tanpa Supabase, memakai data contoh.
 */
function warnIfSupabaseMissing() {
  const isProductionBuild =
    process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_SITE_URL;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && key) return;

  const missing = [
    !url && "NEXT_PUBLIC_SUPABASE_URL",
    !key && "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    isProductionBuild && "NEXT_PUBLIC_SITE_URL",
  ].filter(Boolean);

  console.warn(
    [
      "",
      "  ┌──────────────────────────────────────────────────────────────┐",
      "  │  PERINGATAN: variabel Supabase tidak terbaca saat build       │",
      "  └──────────────────────────────────────────────────────────────┘",
      "",
      `  Belum terisi: ${missing.join(", ")}`,
      "",
      "  Build tetap dilanjutkan, tapi situsnya akan memakai DATA CONTOH,",
      "  bukan produk asli dari Supabase.",
      "",
      "  Kalau merasa sudah mengisinya di Cloudflare, cek lokasinya:",
      "    BENAR  → Settings → Build → 'Build variables and secrets'",
      "    SALAH  → Settings → Variables & Secrets  (itu untuk runtime,",
      "             tidak terbaca saat build, dan terhapus tiap deploy)",
      "",
      "  Di komputer sendiri, isinya diambil dari .env.local",
      "",
    ].join("\n"),
  );
}

warnIfSupabaseMissing();

/** Izinkan gambar dari Supabase Storage bila proyeknya sudah dikonfigurasi */
const supabaseHost = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default nextConfig;

// Menjembatani binding Cloudflare (KV, R2, D1) ke `next dev`.
//
// Sengaja opt-in lewat CF_DEV_BINDINGS=1 karena helper ini menjalankan
// workerd secara lokal, dan workerd butuh macOS 13.5+ / glibc 2.35+.
// Aplikasi ini belum memakai binding apa pun, jadi `next dev` biasa sudah cukup.
// Dirangkai dengan .then() — next.config.ts tidak boleh punya top-level await.
if (process.env.NODE_ENV === "development" && process.env.CF_DEV_BINDINGS) {
  void import("@opennextjs/cloudflare")
    .then(({ initOpenNextCloudflareForDev }) => initOpenNextCloudflareForDev())
    .catch((error: unknown) => {
      console.warn(
        "[next.config] Binding Cloudflare dilewati:",
        error instanceof Error ? error.message : error,
      );
    });
}
