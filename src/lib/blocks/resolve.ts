import { withDefaults } from "@/lib/blocks/registry";
import type { BlockPropsMap, BlockType } from "@/lib/blocks/types";
import { resolveVarsDeep, type TextVars } from "@/lib/site-identity";

/**
 * Isi bawaan sebuah bagian halaman dengan {toko}/{kota}/{provinsi} sudah
 * diganti. Untuk halaman yang memasang bagian tanpa props (Tentang, Cara
 * Pesan), supaya teks bawaannya ikut kota toko, bukan kota pembuat templat.
 */
export function sectionProps<K extends BlockType>(
  type: K,
  vars: TextVars,
): BlockPropsMap[K] {
  return resolveVarsDeep(withDefaults(type), vars);
}
