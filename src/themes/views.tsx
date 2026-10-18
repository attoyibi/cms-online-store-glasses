import { EtalaseHero } from "@/themes/etalase/hero";
import { EtalaseShowcase } from "@/themes/etalase/showcase";
import type { BlockViewMap } from "@/themes/types";

/**
 * Tampilan blok per tema. Jenis blok yang tidak tercantum memakai tampilan
 * klasik di `components/blocks/block-view.tsx`.
 */
const ETALASE_VIEWS: BlockViewMap = {
  hero: (block) => <EtalaseHero {...block.props} />,
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
