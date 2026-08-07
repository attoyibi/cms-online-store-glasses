import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { WhatsAppButton } from "@/components/whatsapp-button";
import { Button } from "@/components/ui/button";

const stats = [
  { value: "2", label: "Toko di Yogyakarta" },
  { value: "500+", label: "Model frame & lensa" },
  { value: "34", label: "Provinsi terjangkau" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Gradasi lembut di belakang kolom kanan */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-32 size-[38rem] rounded-full bg-brand-soft blur-3xl"
      />

      <div className="container-page relative grid items-center gap-12 py-14 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-24">
        <div className="max-w-xl">
          <p className="inline-flex items-center gap-2 rounded-full border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
            <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
            Konsultasi gratis sebelum beli
          </p>

          <h1 className="mt-6 text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-[3.4rem]">
            Kacamata yang pas,
            <br />
            <span className="text-primary">tanpa harus menebak.</span>
          </h1>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
            Ratusan frame, sunglasses, dan lensa pilihan dengan harga yang
            transparan. Ceritakan kebutuhan mata Anda lewat WhatsApp, kami
            bantu carikan yang cocok — lalu kami kirim ke seluruh Indonesia.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="gap-2">
              <Link href="/produk">
                Lihat Koleksi
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <WhatsAppButton size="lg" />
          </div>

          <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t pt-7">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="block text-2xl font-semibold tabular-nums">
                    {stat.value}
                  </span>
                  <span className="mt-1 block text-xs leading-snug text-muted-foreground">
                    {stat.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Susunan gambar berlapis — dua kartu utama dengan satu kartu kecil
            yang menonjol keluar agar komposisinya tidak kaku. */}
        <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative aspect-4/5 overflow-hidden rounded-3xl border bg-muted shadow-sm">
              <Image
                src="/products/browline-jade.svg"
                alt="Frame browline warna jade"
                fill
                sizes="(min-width: 1024px) 22vw, 45vw"
                priority
                unoptimized
                className="object-cover"
              />
            </div>

            <div className="relative mt-10 aspect-4/5 overflow-hidden rounded-3xl border bg-muted shadow-sm">
              <Image
                src="/products/cateye-rose.svg"
                alt="Frame cat-eye warna rose"
                fill
                sizes="(min-width: 1024px) 22vw, 45vw"
                priority
                unoptimized
                className="object-cover"
              />
            </div>
          </div>

          <div className="absolute -bottom-6 left-1/2 w-44 -translate-x-1/2 rounded-2xl border bg-card p-3 shadow-lg sm:-left-6 sm:translate-x-0">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
              <Image
                src="/products/aviator-ink.svg"
                alt="Sunglasses aviator hitam"
                fill
                sizes="176px"
                unoptimized
                className="object-cover"
              />
            </div>
            <p className="mt-2.5 px-0.5 text-xs font-medium">Solano Aviator</p>
            <p className="px-0.5 text-xs text-muted-foreground">
              Polarized UV400
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
