import { defaultHomeBlocks } from "@/lib/blocks/registry";
import type { Block } from "@/lib/blocks/types";
import { etalaseBlocks } from "@/themes/etalase/blocks";

/**
 * Susunan halaman depan bawaan untuk satu tema, dipakai sebelum halaman itu
 * pernah diedit dan saat admin menekan "kembalikan ke bawaan".
 */
export function defaultBlocksFor(layoutId: string | null | undefined): Block[] {
  switch (layoutId) {
    case "etalase":
      return etalaseBlocks();
    default:
      return defaultHomeBlocks();
  }
}
