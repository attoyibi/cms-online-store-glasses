import { PackageOpen } from "lucide-react";

import { ProductCard } from "@/components/product/product-card";
import { WhatsAppButton } from "@/components/whatsapp-button";
import type { Product } from "@/lib/types";

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed py-20 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <PackageOpen
            className="size-5 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
        <p className="font-medium">Belum ada produk yang cocok</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Coba ubah kata kunci atau pilih kategori lain. Kalau yang Anda cari
          tidak ada di katalog, tanyakan saja — sebagian stok belum sempat kami
          unggah.
        </p>
        <div className="pt-1">
          <WhatsAppButton
            message="Halo {store}, saya mencari produk yang belum ada di katalog:"
            label="Tanyakan Stok"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index < 4}
        />
      ))}
    </div>
  );
}
