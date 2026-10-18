import { EtalaseAbout } from "@/themes/etalase/about";
import { EtalaseCategories } from "@/themes/etalase/categories";
import { EtalaseFeatures } from "@/themes/etalase/features";
import { EtalaseHero } from "@/themes/etalase/hero";
import { EtalaseReasons } from "@/themes/etalase/reasons";
import { EtalaseShowcase } from "@/themes/etalase/showcase";
import type { BlockViewMap } from "@/themes/types";

/**
 * Tampilan blok per tema. Jenis blok yang tidak tercantum memakai tampilan
 * klasik di `components/blocks/block-view.tsx`.
 */
const ETALASE_VIEWS: BlockViewMap = {
  hero: (block) => <EtalaseHero {...block.props} />,
  "trust-bar": (block) => <EtalaseFeatures {...block.props} />,
  "category-grid": (block, { categories }) => (
    <EtalaseCategories categories={categories} {...block.props} />
  ),
  about: (block) => <EtalaseAbout {...block.props} />,
  "how-to-order": (block) => <EtalaseReasons {...block.props} />,
  "product-showcase": (block, { products, priority }) => (
    <EtalaseShowcase props={block.props} products={products} priority={priority} />
  ),
};

export function getThemeViews(layoutId: string | null | undefined): BlockViewMap {
  switch (layoutId) {
    case "etalase":
      return ETALASE_VIEWS;
    default:
      return {};
  }
}
