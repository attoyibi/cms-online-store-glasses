import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ProductCard } from "@/components/product/product-card";
import { WhatsAppButton } from "@/components/whatsapp-button";
import type { Product } from "@/lib/types";

const lensTypes = [
  {
    name: "Single Vision",
    body: "Satu titik fokus. Untuk minus, plus, atau silinder biasa.",
  },
  {
    name: "Progresif",
    body: "Jauh, menengah, dan baca dalam satu lensa tanpa garis.",
  },
  {
    name: "Blue Light",
    body: "Menyaring cahaya biru layar. Cocok untuk kerja depan komputer.",
  },
  {
    name: "Photochromic",
    body: "Menggelap sendiri di luar ruangan, bening lagi di dalam.",
  },
];

export function LensSection({ products }: { products: Product[] }) {
  return (
    <section className="bg-secondary/60 py-16 sm:py-20">
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              Lensa
            </p>
            <h2 className="text-2xl font-semibold sm:text-3xl">
              Frame-nya bagus, lensanya jangan asal
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              Lensa menentukan nyaman atau tidaknya kacamata dipakai seharian.
              Kirimkan hasil periksa mata Anda, kami bantu pilihkan tipe dan
              indeks yang sesuai — termasuk memberi tahu kalau yang lebih murah
              sudah cukup.
            </p>

            <dl className="grid gap-4 pt-2 sm:grid-cols-2">
              {lensTypes.map((lens) => (
                <div
                  key={lens.name}
                  className="rounded-xl border bg-card p-4 shadow-sm"
                >
                  <dt className="text-sm font-semibold">{lens.name}</dt>
                  <dd className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {lens.body}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="flex flex-wrap gap-3 pt-2">
              <WhatsAppButton
                variant="default"
                message="Halo {store}, saya mau tanya soal lensa. Ini hasil periksa mata saya:"
                label="Kirim Resep Lensa"
              />
              <Link
                href="/kategori/lensa"
                className="group inline-flex items-center gap-1.5 self-center rounded-lg px-1 text-sm font-medium transition-colors hover:text-primary"
              >
                Lihat semua lensa
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>

          {/* content-start agar kartu tidak ikut meregang setinggi kolom teks */}
          {products.length > 0 && (
            <div className="grid content-start grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
