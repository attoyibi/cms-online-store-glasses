import type { CartItem, Product, ProductVariant } from "@/lib/types";

export function hasVariants(product: Pick<Product, "variants">): boolean {
  return product.variants.length > 0;
}

/** Harga termurah dan termahal dari semua varian; satu harga bila tanpa varian */
export function priceRange(product: Pick<Product, "price" | "variants">): {
  min: number;
  max: number;
} {
  if (product.variants.length === 0) {
    return { min: product.price, max: product.price };
  }
  const prices = product.variants.map((variant) => variant.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

/**
 * Terapkan ringkasan varian ke produk: harga = termurah, stok = jumlah.
 * Harga coret dikosongkan karena tiap varian punya harga coretnya sendiri,
 * dan tidak ada satu angka yang mewakili semuanya.
 */
export function withVariantSummary<T extends Omit<Product, "variants">>(
  product: T,
  variants: ProductVariant[],
): T & { variants: ProductVariant[] } {
  const sorted = [...variants].sort(
    (a, b) => a.sort_order - b.sort_order || a.price - b.price,
  );
  if (sorted.length === 0) return { ...product, variants: sorted };

  return {
    ...product,
    variants: sorted,
    price: Math.min(...sorted.map((v) => v.price)),
    compare_at_price: null,
    stock: sorted.reduce((sum, v) => sum + v.stock, 0),
  };
}

/** Satu baris di keranjang = produk + varian-nya, bukan produknya saja */
export function lineId(item: Pick<CartItem, "productId" | "variantId">): string {
  return `${item.productId}:${item.variantId ?? ""}`;
}
