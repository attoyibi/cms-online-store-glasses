import { AboutStrip } from "@/components/sections/about-strip";
import { CategoryGrid } from "@/components/sections/category-grid";
import { CtaBanner } from "@/components/sections/cta-banner";
import { FaqSection } from "@/components/sections/faq-section";
import { Hero } from "@/components/sections/hero";
import { HowToOrder } from "@/components/sections/how-to-order";
import { LensSection } from "@/components/sections/lens-section";
import { ProductShowcase } from "@/components/sections/product-showcase";
import { Testimonials } from "@/components/sections/testimonials";
import { TrustBar } from "@/components/sections/trust-bar";
import { getCategories, getProducts } from "@/lib/data/queries";

export default async function HomePage() {
  const [categories, bestSellers, newArrivals, lenses] = await Promise.all([
    getCategories(),
    getProducts({ featuredOnly: true, limit: 5 }),
    getProducts({ sort: "terbaru", limit: 5 }),
    getProducts({ categorySlug: "lensa", limit: 3 }),
  ]);

  return (
    <>
      <Hero />
      <TrustBar />
      <CategoryGrid categories={categories} />

      <ProductShowcase
        eyebrow="Paling Dicari"
        title="Best seller bulan ini"
        description="Model yang paling sering dipesan dan paling jarang dikembalikan."
        action={{ label: "Lihat semua", href: "/produk" }}
        products={bestSellers}
        priority
      />

      <AboutStrip />

      <ProductShowcase
        eyebrow="Baru Datang"
        title="Koleksi terbaru"
        description="Baru masuk katalog dalam beberapa minggu terakhir."
        action={{ label: "Lihat semua", href: "/produk?sort=terbaru" }}
        products={newArrivals}
        className="bg-secondary/60"
      />

      <LensSection products={lenses} />
      <HowToOrder />
      <Testimonials />
      <FaqSection />
      <CtaBanner />
    </>
  );
}
