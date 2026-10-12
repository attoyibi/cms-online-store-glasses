import { Fragment, type ReactNode } from "react";

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
import type { Block, ProductShowcaseProps } from "@/lib/blocks/types";
import { getCategories, getProducts } from "@/lib/data/queries";

function showcaseQuery(props: ProductShowcaseProps) {
  if (props.source === "kategori") {
    return { categorySlug: props.categorySlug, limit: props.limit };
  }
  if (props.source === "terbaru") {
    return { sort: "terbaru" as const, limit: props.limit };
  }
  return { featuredOnly: true, limit: props.limit };
}

async function renderBlock(
  block: Block,
  priorityShowcaseId: string | null,
): Promise<ReactNode> {
  switch (block.type) {
    case "hero":
      return <Hero {...block.props} />;

    case "trust-bar":
      return <TrustBar {...block.props} />;

    case "category-grid":
      return (
        <CategoryGrid categories={await getCategories()} {...block.props} />
      );

    case "product-showcase": {
      const { props } = block;
      // Sumber "kategori" tanpa slug berarti belum diatur — jangan tampilkan semua produk
      const products =
        props.source === "kategori" && !props.categorySlug
          ? []
          : await getProducts(showcaseQuery(props));

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
          priority={block.id === priorityShowcaseId}
          className={props.background === "lembut" ? "bg-secondary/60" : undefined}
        />
      );
    }

    case "about":
      return <AboutStrip {...block.props} />;

    case "lens": {
      const { props } = block;
      const products =
        props.limit > 0 && props.categorySlug
          ? await getProducts({
              categorySlug: props.categorySlug,
              limit: props.limit,
            })
          : [];
      return <LensSection products={products} {...props} />;
    }

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

/**
 * Merender susunan blok halaman. Blok yang disembunyikan dilewati; data
 * produk dan kategori tiap blok diambil bersamaan.
 */
export async function BlockRenderer({ blocks }: { blocks: Block[] }) {
  const visible = blocks.filter((block) => !block.hidden);

  // Gambar produk di deretan produk pertama dimuat lebih awal
  const priorityShowcaseId =
    visible.find((block) => block.type === "product-showcase")?.id ?? null;

  const nodes = await Promise.all(
    visible.map((block) => renderBlock(block, priorityShowcaseId)),
  );

  return (
    <>
      {visible.map((block, index) => (
        <Fragment key={block.id}>{nodes[index]}</Fragment>
      ))}
    </>
  );
}
