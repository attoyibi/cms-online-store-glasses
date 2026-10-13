import type { Metadata, Viewport } from "next";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";

import { StoreSettingsProvider } from "@/components/store-settings-provider";
import { Toaster } from "@/components/ui/sonner";
import { getSiteIdentity, getStoreSettings } from "@/lib/data/queries";
import { absoluteUrl } from "@/lib/seo";

import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const id = await getSiteIdentity();
  const title = `${id.name} — ${id.tagline}`;
  const ogImage = id.ogImage ? absoluteUrl(id.ogImage, id.siteUrl) : undefined;

  return {
    metadataBase: new URL(id.siteUrl),
    title: { default: title, template: `%s | ${id.name}` },
    description: id.description,
    keywords: [
      "kacamata",
      "toko kacamata online",
      `optik ${id.city.toLowerCase()}`,
      "frame kacamata",
      "lensa kacamata",
      "sunglasses",
    ],
    openGraph: {
      type: "website",
      locale: "id_ID",
      url: id.siteUrl,
      siteName: id.name,
      title,
      description: id.description,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    robots: id.noindexSite
      ? { index: false, follow: false }
      : { index: true, follow: true },
    verification: {
      google: id.googleVerification ?? undefined,
      other: id.bingVerification
        ? { "msvalidate.01": id.bingVerification }
        : undefined,
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfbf8" },
    { media: "(prefers-color-scheme: dark)", color: "#111917" },
  ],
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const settings = await getStoreSettings();

  return (
    <html
      lang="id"
      className={`${jakarta.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <StoreSettingsProvider settings={settings}>
          {children}
        </StoreSettingsProvider>
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
