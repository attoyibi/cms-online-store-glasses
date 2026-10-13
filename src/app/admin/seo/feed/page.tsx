import { getProducts, getSiteIdentity } from "@/lib/data/queries";
import { buildMerchantFeed } from "@/lib/merchant-feed";
import { requireAdmin } from "@/lib/supabase/admin";

export default async function AdminFeedPage() {
  await requireAdmin();

  const identity = await getSiteIdentity();
  const products = identity.noindexSite ? [] : await getProducts();
  const feed = buildMerchantFeed(identity, products);
  const url = `${identity.siteUrl}/feed/google-merchant.xml`;

  return (
    <div className="max-w-3xl space-y-6">
      <p className="text-sm text-muted-foreground">
        Daftar produk dalam format yang dibaca Google Merchant Center, supaya
        produk bisa tampil gratis di tab Shopping dan Google Gambar. Format yang
        sama juga diterima katalog Meta (Instagram/Facebook) dan TikTok.
      </p>

      {identity.noindexSite && (
        <p
          role="alert"
          className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"
        >
          Situs sedang disembunyikan dari Google, jadi feed ini sengaja
          dikosongkan.
        </p>
      )}

      <section className="space-y-2 rounded-xl border bg-card p-5">
        <h2 className="text-base font-semibold">Alamat feed</h2>
        <code className="block break-all rounded-lg bg-muted px-3 py-2 font-mono text-sm">
          {url}
        </code>
        <p className="text-sm text-muted-foreground">
          <strong>{feed.included}</strong> produk masuk feed
          {feed.skipped.length > 0 && (
            <>
              , <strong>{feed.skipped.length}</strong> dilewati
            </>
          )}
          .
        </p>
      </section>

      {feed.skipped.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold">Produk yang dilewati</h2>
          <ul className="divide-y rounded-xl border bg-card">
            {feed.skipped.map((item) => (
              <li key={item.slug} className="p-4 text-sm">
                <span className="font-medium">{item.name}</span>
                <span className="text-muted-foreground"> — {item.reason}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-2 rounded-xl border bg-card p-5 text-sm">
        <h2 className="text-base font-semibold">Cara memakai</h2>
        <ol className="list-decimal space-y-1.5 pl-5 text-muted-foreground">
          <li>
            Buka Google Merchant Center, daftarkan toko, dan verifikasi alamat
            situs {identity.siteUrl}.
          </li>
          <li>
            Isi pengaturan pengiriman, pajak, dan kebijakan pengembalian di
            sana. Merchant Center mewajibkannya dan tidak bisa dibaca dari
            situs ini.
          </li>
          <li>
            Produk → Feed → Tambah feed → pilih “Feed terjadwal”, lalu tempel
            alamat feed di atas dan atur pengambilan harian.
          </li>
          <li>
            Feed ini belum memuat kode kategori Google (google_product_category)
            dan nomor GTIN karena data itu tidak ada di katalog; produk dikirim
            sebagai “tanpa GTIN”. Merchant Center akan menyarankan kategori
            otomatis.
          </li>
        </ol>
      </section>
    </div>
  );
}
