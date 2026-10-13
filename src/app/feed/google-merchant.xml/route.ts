import { getProducts, getSiteIdentity } from "@/lib/data/queries";
import { buildMerchantFeed } from "@/lib/merchant-feed";

/**
 * Feed produk untuk Google Merchant Center (juga dibaca katalog Meta dan
 * TikTok). Alamat: /feed/google-merchant.xml. Dibangun dari katalog saat
 * diminta; hasilnya boleh disimpan cache CDN satu jam.
 */
export async function GET() {
  const identity = await getSiteIdentity();

  // Situs yang sengaja disembunyikan tidak boleh mengiklankan produknya
  const products = identity.noindexSite ? [] : await getProducts();
  const { xml } = buildMerchantFeed(identity, products);

  return new Response(xml, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600",
    },
  });
}
