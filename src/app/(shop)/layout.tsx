import { CartProvider } from "@/components/cart/cart-provider";
import { CartSheet } from "@/components/cart/cart-sheet";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";
import { getCategories, getStoreSettings } from "@/lib/data/queries";

export default async function ShopLayout({ children }: LayoutProps<"/">) {
  const [categories, settings] = await Promise.all([
    getCategories(),
    getStoreSettings(),
  ]);

  return (
    <CartProvider>
      <SiteHeader categories={categories} />
      <main className="flex-1">{children}</main>
      <SiteFooter categories={categories} settings={settings} />
      <CartSheet />
      <WhatsAppFloat />
    </CartProvider>
  );
}
