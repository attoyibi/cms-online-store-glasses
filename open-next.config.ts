import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * Konfigurasi minimal agar `npm run deploy` bisa langsung jalan tanpa
 * menyiapkan resource lain lebih dulu.
 *
 * Bila nanti butuh ISR cache yang persisten antar request, buat bucket R2
 * lalu aktifkan:
 *
 *   import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
 *   export default defineCloudflareConfig({ incrementalCache: r2IncrementalCache });
 *
 * dan tambahkan binding `NEXT_INC_CACHE_R2_BUCKET` di wrangler.jsonc.
 */
export default defineCloudflareConfig();
