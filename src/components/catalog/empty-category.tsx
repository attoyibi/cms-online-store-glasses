import Link from "next/link";
import { PackageOpen } from "lucide-react";

import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/whatsapp-button";
import type { Product } from "@/lib/types";

/**
 * Tampilan untuk kategori yang memang belum punya produk.
 *
 * Dipisahkan tegas dari rekomendasi di bawahnya: tanpa keterangan dan
 * pembatas, produk rekomendasi terbaca seolah-olah isi kategori itu sendiri.
 */
export function EmptyCategory({
  categoryName,
  recommended,
}: {
  categoryName: string;
  recommended: Product[];
}) {
  return (
    <div className="space-y-14">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-5 py-14 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <PackageOpen
            className="size-5 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
        <h2 className="text-lg font-semibold">
          Belum ada produk di kategori {categoryName}
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          Produk untuk kategori ini sedang kami siapkan. Kalau Anda sedang
          mencarinya, tanyakan langsung — stok yang belum sempat diunggah
          sering kali sudah tersedia di toko.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-1">
          <WhatsAppButton
            message={`Halo {store}, apakah ${categoryName} tersedia?`}
            label="Tanyakan Lewat WhatsApp"
          />
          <Button asChild variant="outline">
            <Link href="/produk">Lihat Semua Produk</Link>
          </Button>
        </div>
      </div>

      {recommended.length > 0 && (
        <section aria-labelledby="rekomendasi-heading">
          <div className="flex items-center gap-4">
            <span className="h-px flex-1 bg-border" aria-hidden="true" />
            <div className="text-center">
              <h2
                id="rekomendasi-heading"
                className="text-sm font-semibold uppercase tracking-wider"
              >
                Rekomendasi produk lain
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Bukan bagian dari {categoryName} — produk pilihan kami yang
                mungkin Anda suka.
              </p>
            </div>
            <span className="h-px flex-1 bg-border" aria-hidden="true" />
          </div>

          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4">
            {recommended.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
