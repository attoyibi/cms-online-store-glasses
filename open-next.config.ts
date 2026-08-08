import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * Konfigurasi minimal agar deploy bisa langsung jalan tanpa menyiapkan
 * resource lain lebih dulu.
 *
 * Bila nanti butuh ISR cache yang persisten antar request, buat bucket R2
 * lalu aktifkan:
 *
 *   import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
 *   defineCloudflareConfig({ incrementalCache: r2IncrementalCache })
 *
 * dan tambahkan binding `NEXT_INC_CACHE_R2_BUCKET` di wrangler.jsonc.
 */
const config = {
  ...defineCloudflareConfig(),

  /**
   * Bawaannya OpenNext menjalankan `npm run build` untuk membangun aplikasi
   * Next.js. Karena script `build` di package.json justru memanggil
   * `opennextjs-cloudflare build` — supaya Cloudflare Workers Builds bekerja
   * tanpa mengubah build command di dashboard — perintah itu akan memanggil
   * dirinya sendiri tanpa henti.
   *
   * Menunjuk langsung ke `next build` memutus rekursi tersebut.
   */
  buildCommand: "npx next build",
};

export default config;
