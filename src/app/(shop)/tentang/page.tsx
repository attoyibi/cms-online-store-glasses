import type { Metadata } from "next";

import { AboutStrip } from "@/components/sections/about-strip";
import { CtaBanner } from "@/components/sections/cta-banner";
import { Testimonials } from "@/components/sections/testimonials";
import { TrustBar } from "@/components/sections/trust-bar";

export const metadata: Metadata = {
  title: "Tentang Kami",
  alternates: { canonical: "/tentang" },
  description:
    "Optik kecil dari Yogyakarta yang menyeleksi sendiri setiap frame sebelum masuk katalog.",
};

export default function AboutPage() {
  return (
    <>
      <div className="container-page pb-4 pt-10 sm:pt-14">
        <header className="max-w-2xl space-y-3">
          <h1 className="text-3xl font-semibold sm:text-4xl">Tentang Kami</h1>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Kami menjual kacamata, tapi yang sebenarnya kami kerjakan adalah
            membantu orang melihat dengan nyaman. Itu dua hal yang berbeda.
          </p>
        </header>
      </div>

      <AboutStrip />
      <TrustBar />
      <Testimonials />
      <CtaBanner />
    </>
  );
}
