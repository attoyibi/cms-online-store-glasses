import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { WhatsAppButton } from "@/components/whatsapp-button";
import { Button } from "@/components/ui/button";
import { withDefaults } from "@/lib/blocks/registry";
import type { HeroProps } from "@/lib/blocks/types";
import { HeroSlider } from "@/themes/etalase/hero-slider";

/**
 * Hero tema Etalase: latar gelap, teks di kiri, gambar berbingkai dengan
 * slider di kanan. Memakai props hero yang sama dengan tema klasik:
 * tiga gambar menjadi slide, tiga "angka ringkas" menjadi tiga poin kecil.
 * Padding bawah sengaja lebih besar agar deretan kartu di bawahnya bisa
 * menimpa tepi hero.
 */
export function EtalaseHero(props: Partial<HeroProps>) {
  const p = withDefaults("hero", props);

  const slides = [
    { src: p.imageA, alt: p.imageAAlt },
    { src: p.imageB, alt: p.imageBAlt },
    { src: p.imageC, alt: p.imageCAlt },
  ].filter((slide) => slide.src);

  return (
    <section className="etalase-hero relative overflow-hidden bg-ink text-ink-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-24 size-[34rem] rounded-full bg-primary/30 blur-3xl"
      />

      <div className="container-page relative grid items-center gap-10 pb-28 pt-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:pb-36 lg:pt-20">
        <div className="max-w-xl">
          {p.eyebrow && (
            <p className="inline-flex items-center rounded-full border border-ink-foreground/20 bg-ink-foreground/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-ink-foreground/90">
              {p.eyebrow}
            </p>
          )}

          <h1 className="mt-5 text-3xl font-semibold leading-tight sm:text-4xl lg:text-[2.75rem]">
            {p.titleLine1 && (
              <>
                {p.titleLine1}
                <br />
              </>
            )}
            <span className="text-accent">{p.titleHighlight}</span>
          </h1>

          {p.description && (
            <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-foreground/75">
              {p.description}
            </p>
          )}

          <div className="mt-7 flex flex-wrap gap-3">
            {p.whatsappLabel && (
              <WhatsAppButton
                size="lg"
                variant="default"
                label={p.whatsappLabel}
                message={p.whatsappMessage}
                className="bg-whatsapp text-white hover:bg-whatsapp/90"
              />
            )}
            {p.primaryLabel && p.primaryHref && (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="gap-2 border-ink-foreground/30 bg-transparent text-ink-foreground hover:bg-ink-foreground/10 hover:text-ink-foreground"
              >
                <Link href={p.primaryHref}>
                  {p.primaryLabel}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            )}
          </div>

          {p.stats.length > 0 && (
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-5 border-t border-ink-foreground/15 pt-6">
              {p.stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="text-sm font-semibold">{stat.value}</dt>
                  <dd className="mt-1 text-xs leading-snug text-ink-foreground/65">
                    {stat.label}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <div className="mx-auto w-full max-w-sm lg:max-w-md lg:justify-self-end">
          <HeroSlider slides={slides} />
        </div>
      </div>
    </section>
  );
}
