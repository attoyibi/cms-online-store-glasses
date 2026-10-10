"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Product, ProductVariant } from "@/lib/types";

type Props = {
  product: Pick<Product, "id" | "slug" | "name" | "price" | "images" | "stock">;
  /** Varian yang dipilih; harga & stok-nya menggantikan milik produk */
  option?: ProductVariant | null;
  quantity?: number;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "secondary";
  className?: string;
  /** Buka panel keranjang setelah item ditambahkan */
  openCart?: boolean;
  label?: string;
};

export function AddToCartButton({
  product,
  option = null,
  quantity = 1,
  size = "default",
  variant = "default",
  className,
  openCart = false,
  label = "Tambah ke Keranjang",
}: Props) {
  const { add, setOpen } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const soldOut = (option?.stock ?? product.stock) <= 0;

  function handleClick() {
    add(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: option?.price ?? product.price,
        image: product.images[0] ?? null,
        variantId: option?.id ?? null,
        variantLabel: option?.label ?? null,
      },
      quantity,
    );

    if (openCart) {
      setOpen(true);
    } else {
      toast.success("Masuk keranjang", {
        description: option ? `${product.name} — ${option.label}` : product.name,
      });
    }

    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1600);
  }

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      disabled={soldOut}
      onClick={handleClick}
      className={cn("gap-2", className)}
    >
      {justAdded ? (
        <Check className="size-4" aria-hidden="true" />
      ) : (
        <ShoppingBag className="size-4" aria-hidden="true" />
      )}
      {soldOut ? "Stok Habis" : justAdded ? "Ditambahkan" : label}
    </Button>
  );
}
