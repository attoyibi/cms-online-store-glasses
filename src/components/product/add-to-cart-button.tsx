"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

type Props = {
  product: Pick<Product, "id" | "slug" | "name" | "price" | "images" | "stock">;
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
  quantity = 1,
  size = "default",
  variant = "default",
  className,
  openCart = false,
  label = "Tambah ke Keranjang",
}: Props) {
  const { add, setOpen } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const soldOut = product.stock <= 0;

  function handleClick() {
    add(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.images[0] ?? null,
      },
      quantity,
    );

    if (openCart) {
      setOpen(true);
    } else {
      toast.success("Masuk keranjang", { description: product.name });
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
