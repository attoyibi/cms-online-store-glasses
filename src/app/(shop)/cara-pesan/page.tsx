import type { Metadata } from "next";

import { CtaBanner } from "@/components/sections/cta-banner";
import { FaqSection } from "@/components/sections/faq-section";
import { HowToOrder } from "@/components/sections/how-to-order";
import { sectionProps } from "@/lib/blocks/resolve";
import { getSiteIdentity } from "@/lib/data/queries";
import { pageMetadata } from "@/lib/page-meta";
import { textVars } from "@/lib/site-identity";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("cara-pesan", {
    fallback: {
      title: "Cara Pesan",
      description:
        "Empat langkah memesan kacamata: pilih produk, kirim ke WhatsApp, konfirmasi pembayaran, lalu barang dikirim.",
    },
    canonical: "/cara-pesan",
  });
}

export default async function HowToOrderPage() {
  const vars = textVars(await getSiteIdentity());

  return (
    <>
      <div className="container-page pt-10 sm:pt-14">
        <header className="max-w-2xl space-y-3">
          <h1 className="text-3xl font-semibold sm:text-4xl">Cara Pesan</h1>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Tidak perlu membuat akun dan tidak ada pembayaran di situs ini.
            Semua transaksi diselesaikan lewat WhatsApp supaya Anda bisa
            memastikan stok, ongkir, dan detail lensa sebelum membayar.
          </p>
        </header>
      </div>

      <HowToOrder />
      <FaqSection {...sectionProps("faq", vars)} />
      <CtaBanner />
    </>
  );
}
