"use client";

import { ShoppingBag } from "lucide-react";

import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CartButton({ className }: { className?: string }) {
  const { count, ready, setOpen } = useCart();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setOpen(true)}
      className={cn("relative", className)}
      aria-label={
        count > 0 ? `Buka keranjang, ${count} item` : "Buka keranjang, kosong"
      }
    >
      <ShoppingBag className="size-5" aria-hidden="true" />
      {/* Badge baru muncul setelah localStorage terbaca agar server dan
          client merender hal yang sama pada render pertama */}
      {ready && count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-4.5 text-primary-foreground tabular-nums">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Button>
  );
}
