import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { WhatsAppButton } from "@/components/whatsapp-button";
import { Button } from "@/components/ui/button";
import { withDefaults } from "@/lib/blocks/registry";
import type { HeroProps } from "@/lib/blocks/types";

/** Gambar hero; kosong = kotak polos supaya tata letak tidak runtuh */
function HeroImage({
  src,
  alt,
  sizes,
  priority,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
}) {
  if (!src) return null;
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={src.toLowerCase().endsWith(".svg")}
      className="object-cover"
    />
  );
}

export function Hero(props: Partial<HeroProps>) {
  const p = withDefaults("hero", props);

  return (
    <section className="relative overflow-hidden">
      {/* Gradasi lembut di belakang kolom kanan */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-32 size-[38rem] rounded-full bg-brand-soft blur-3xl"
      />

      <div className="container-page relative grid items-center gap-12 py-14 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-24">
        <div className="max-w-xl">
          {p.eyebrow && (
            <p className="inline-flex items-center gap-2 rounded-full border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
              <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
              {p.eyebrow}
            </p>
          )}

          <h1 className="mt-6 text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-[3.4rem]">
            {p.titleLine1 && (
              <>
                {p.titleLine1}
                <br />
              </>
            )}
            <span className="text-primary">{p.titleHighlight}</span>
          </h1>

          {p.description && (
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
              {p.description}
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            {p.primaryLabel && p.primaryHref && (
              <Button asChild size="lg" className="gap-2">
                <Link href={p.primaryHref}>
                  {p.primaryLabel}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            )}
            {p.whatsappLabel && (
              <WhatsAppButton
                size="lg"
                label={p.whatsappLabel}
                message={p.whatsappMessage}
              />
            )}
          </div>

          {p.stats.length > 0 && (
            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t pt-7">
              {p.stats.map((stat) => (
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
          )}
        </div>

        {/* Susunan gambar berlapis — dua kartu utama dengan satu kartu kecil
            yang menonjol keluar agar komposisinya tidak kaku. */}
        <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative aspect-4/5 overflow-hidden rounded-3xl border bg-muted shadow-sm">
              <HeroImage
                src={p.imageA}
                alt={p.imageAAlt}
                sizes="(min-width: 1024px) 22vw, 45vw"
                priority
              />
            </div>

            <div className="relative mt-10 aspect-4/5 overflow-hidden rounded-3xl border bg-muted shadow-sm">
              <HeroImage
                src={p.imageB}
                alt={p.imageBAlt}
                sizes="(min-width: 1024px) 22vw, 45vw"
                priority
              />
            </div>
          </div>

          {(p.imageC || p.cardTitle) && (
            <div className="absolute -bottom-6 left-1/2 w-44 -translate-x-1/2 rounded-2xl border bg-card p-3 shadow-lg sm:-left-6 sm:translate-x-0">
              <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                <HeroImage src={p.imageC} alt={p.imageCAlt} sizes="176px" />
              </div>
              <p className="mt-2.5 px-0.5 text-xs font-medium">{p.cardTitle}</p>
              <p className="px-0.5 text-xs text-muted-foreground">
                {p.cardSubtitle}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
