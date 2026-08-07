import type { Metadata, Viewport } from "next";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";

import { StoreSettingsProvider } from "@/components/store-settings-provider";
import { Toaster } from "@/components/ui/sonner";
import { getStoreSettings } from "@/lib/data/queries";
import { siteConfig } from "@/lib/site-config";

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

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "kacamata",
    "toko kacamata online",
    "optik yogyakarta",
    "frame kacamata",
    "lensa kacamata",
    "sunglasses",
  ],
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  robots: { index: true, follow: true },
};

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
