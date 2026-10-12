import { Fragment } from "react";

import { BlockView, priorityShowcaseId } from "@/components/blocks/block-view";
import type { Block } from "@/lib/blocks/types";
import { getCategories, getProducts } from "@/lib/data/queries";
import type { Category, Product } from "@/lib/types";

type BlockData = { products: Product[]; categories: Category[] };

const NONE: BlockData = { products: [], categories: [] };

/** Data yang dibutuhkan satu blok, diambil dari database */
async function loadData(block: Block): Promise<BlockData> {
  switch (block.type) {
    case "category-grid":
      return { products: [], categories: await getCategories() };

    case "product-showcase": {
      const { source, categorySlug, limit } = block.props;
      // Sumber "kategori" tanpa slug berarti belum diatur — jangan tampilkan semua produk
      if (source === "kategori" && !categorySlug) return NONE;

      const products = await getProducts(
        source === "kategori"
          ? { categorySlug, limit }
          : source === "terbaru"
            ? { sort: "terbaru", limit }
            : { featuredOnly: true, limit },
      );
      return { products, categories: [] };
    }

    case "lens": {
      const { categorySlug, limit } = block.props;
      if (limit <= 0 || !categorySlug) return NONE;
      return {
        products: await getProducts({ categorySlug, limit }),
        categories: [],
      };
    }

    default:
      return NONE;
  }
}

/**
 * Merender susunan blok halaman publik. Blok yang disembunyikan dilewati;
 * data tiap blok diambil bersamaan lalu diserahkan ke `BlockView`.
 */
export async function BlockRenderer({ blocks }: { blocks: Block[] }) {
  const visible = blocks.filter((block) => !block.hidden);
  const priorityId = priorityShowcaseId(blocks);

  const data = await Promise.all(visible.map(loadData));

  return (
    <>
      {visible.map((block, index) => (
        <Fragment key={block.id}>
          <BlockView
            block={block}
            products={data[index].products}
            categories={data[index].categories}
            priority={block.id === priorityId}
          />
        </Fragment>
      ))}
    </>
  );
}
