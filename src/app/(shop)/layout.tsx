import { Analytics } from "@/components/analytics";
import { CartProvider } from "@/components/cart/cart-provider";
import { CartSheet } from "@/components/cart/cart-sheet";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";
import { getLayout } from "@/lib/layouts";
import { themeCss } from "@/lib/themes";
import {
  getCategories,
  getSeoSettings,
  getSiteIdentity,
  getStoreSettings,
} from "@/lib/data/queries";

export default async function ShopLayout({ children }: LayoutProps<"/">) {
  const [categories, settings, seo, identity] = await Promise.all([
    getCategories(),
    getStoreSettings(),
    getSeoSettings(),
    getSiteIdentity(),
  ]);

  // Tema hanya diterapkan di toko; panel admin sengaja tetap warna bawaan.
  const css = themeCss(settings.theme, settings.theme_colors);

  return (
    <CartProvider>
      {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
      <SiteHeader categories={categories} layout={getLayout(settings.layout).id} />
      <main className="flex-1">{children}</main>
      <SiteFooter
        categories={categories}
        settings={settings}
        description={identity.description}
      />
      <CartSheet />
      <WhatsAppFloat />
      <Analytics
        ga4Id={seo?.ga4_id ?? null}
        metaPixelId={seo?.meta_pixel_id ?? null}
      />
    </CartProvider>
  );
}
