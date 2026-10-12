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
import type { Block } from "@/lib/blocks/types";
import type { Category, Product } from "@/lib/types";

/**
 * Tampilan satu blok. SINKRON dan tanpa pengambilan data — produk dan
 * kategori diberikan dari luar — sehingga komponen yang sama dipakai di dua
 * tempat dan hasilnya pasti sama:
 *  - halaman publik (`BlockRenderer`, data dari database di server)
 *  - pratinjau langsung di editor (data dari memori, dirender di browser)
 */
export function BlockView({
  block,
  products,
  categories,
  priority,
}: {
  block: Block;
  /** Produk untuk blok ini (deretan produk atau lensa) */
  products: Product[];
  categories: Category[];
  /** Gambar produk dimuat lebih awal (deretan produk pertama di halaman) */
  priority: boolean;
}) {
  switch (block.type) {
    case "hero":
      return <Hero {...block.props} />;

    case "trust-bar":
      return <TrustBar {...block.props} />;

    case "category-grid":
      return <CategoryGrid categories={categories} {...block.props} />;

    case "product-showcase": {
      const { props } = block;
      return (
        <ProductShowcase
          eyebrow={props.eyebrow || undefined}
          title={props.title}
          description={props.description || undefined}
          action={
            props.actionLabel && props.actionHref
              ? { label: props.actionLabel, href: props.actionHref }
              : undefined
          }
          products={products}
          priority={priority}
          className={props.background === "lembut" ? "bg-secondary/60" : undefined}
        />
      );
    }

    case "about":
      return <AboutStrip {...block.props} />;

    case "lens":
      return <LensSection products={products} {...block.props} />;

    case "how-to-order":
      return <HowToOrder {...block.props} />;

    case "testimonials":
      return <Testimonials {...block.props} />;

    case "faq":
      return <FaqSection {...block.props} />;

    case "cta":
      return <CtaBanner {...block.props} />;
  }
}

/** ID deretan produk pertama yang tampil — gambarnya diberi prioritas muat */
export function priorityShowcaseId(blocks: Block[]): string | null {
  return (
    blocks.find((block) => !block.hidden && block.type === "product-showcase")
      ?.id ?? null
  );
}
