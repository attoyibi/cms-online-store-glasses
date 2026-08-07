import type { NextConfig } from "next";

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
