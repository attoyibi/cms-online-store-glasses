import { Analytics } from "@/components/analytics";
import { CartProvider } from "@/components/cart/cart-provider";
import { CartSheet } from "@/components/cart/cart-sheet";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";
import {
  getCategories,
  getSeoSettings,
  getSiteIdentity,
  getStoreSettings,
} from "@/lib/data/queries";
import { getLayout } from "@/lib/layouts";
import { themeCss } from "@/lib/themes";

/**
 * Bingkai halaman toko: header, footer, keranjang, tombol WhatsApp, dan warna
 * tema. Dipakai layout toko dan halaman pratinjau tema; yang terakhir memilih
 * `layoutId` sendiri dan mematikan pelacakan supaya kunjungan admin tidak
 * masuk ke Google Analytics atau Meta Pixel.
 */
export async function ShopShell({
  children,
  layoutId,
  analytics = true,
}: {
  children: React.ReactNode;
  /** Tema yang dipakai; kosong = tema yang aktif di Pengaturan */
  layoutId?: string;
  analytics?: boolean;
}) {
  const [categories, settings, seo, identity] = await Promise.all([
    getCategories(),
    getStoreSettings(),
    getSeoSettings(),
    getSiteIdentity(),
  ]);

  const layout = getLayout(layoutId ?? settings.layout).id;

  // Tema hanya diterapkan di toko; panel admin sengaja tetap warna bawaan.
  const css = themeCss(settings.theme, settings.theme_colors);

  return (
    <CartProvider>
      {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
      <SiteHeader categories={categories} layout={layout} />
      <main className="flex-1">{children}</main>
      <SiteFooter
        categories={categories}
        settings={settings}
        description={identity.description}
      />
      <CartSheet />
      <WhatsAppFloat />
      {analytics && (
        <Analytics
          ga4Id={seo?.ga4_id ?? null}
          metaPixelId={seo?.meta_pixel_id ?? null}
        />
      )}
    </CartProvider>
  );
}
