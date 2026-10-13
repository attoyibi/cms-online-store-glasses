import type { Metadata } from "next";

import { AboutStrip } from "@/components/sections/about-strip";
import { CtaBanner } from "@/components/sections/cta-banner";
import { Testimonials } from "@/components/sections/testimonials";
import { TrustBar } from "@/components/sections/trust-bar";
import { sectionProps } from "@/lib/blocks/resolve";
import { getSiteIdentity } from "@/lib/data/queries";
import { textVars } from "@/lib/site-identity";

export async function generateMetadata(): Promise<Metadata> {
  const { city } = await getSiteIdentity();
  return {
    title: "Tentang Kami",
    alternates: { canonical: "/tentang" },
    description: `Optik kecil dari ${city} yang menyeleksi sendiri setiap frame sebelum masuk katalog.`,
  };
}

export default async function AboutPage() {
  const vars = textVars(await getSiteIdentity());

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

      <AboutStrip {...sectionProps("about", vars)} />
      <TrustBar {...sectionProps("trust-bar", vars)} />
      <Testimonials />
      <CtaBanner />
    </>
  );
}
