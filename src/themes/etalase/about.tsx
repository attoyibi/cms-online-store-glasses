import Image from "next/image";
import { Check } from "lucide-react";

import { WhatsAppButton } from "@/components/whatsapp-button";
import { withDefaults } from "@/lib/blocks/registry";
import type { AboutProps } from "@/lib/blocks/types";
import { cn } from "@/lib/utils";

/**
 * Blok "Tentang kami" tema Etalase, dua rupa dari props yang sama:
 *  - tanpa gambar: pita lembut dua kolom (judul besar | isi dan tombol)
 *  - dengan gambar: panel gelap berisi gambar, teks, dan daftar poin
 */
export function EtalaseAbout(props: Partial<AboutProps>) {
  const p = withDefaults("about", props);

  const cta = p.ctaLabel ? (
    <WhatsAppButton
      size="lg"
      variant="default"
      message={p.ctaMessage}
      label={p.ctaLabel}
      className="bg-whatsapp text-white hover:bg-whatsapp/90"
    />
  ) : null;

  if (!p.image) {
    return (
      <section className="bg-secondary/60 py-14 sm:py-20">
        <div className="container-page grid items-start gap-8 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-4">
            {p.eyebrow && (
              <p className="inline-flex rounded-full border bg-card px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider">
                {p.eyebrow}
              </p>
            )}
            <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">
              {p.title}
            </h2>
          </div>

          <div className="space-y-5">
            {p.body && (
              <p className="text-base leading-relaxed text-muted-foreground">
                {p.body}
              </p>
            )}
            {p.points.length > 0 && (
              <ul className="space-y-2.5">
                {p.points.map((point, index) => (
                  <li key={`${point}-${index}`} className="flex items-start gap-2.5 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                    <span className="leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            )}
            {cta}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container-page py-14 sm:py-20">
      <div className="grid items-center gap-10 rounded-3xl bg-ink p-6 text-ink-foreground sm:p-10 lg:grid-cols-2 lg:gap-14 lg:p-14">
        <div
          className={cn(
            "relative order-last aspect-4/3 overflow-hidden rounded-2xl bg-card",
            p.imagePosition === "kanan" ? "lg:order-last" : "lg:order-first",
          )}
        >
          <Image
            src={p.image}
            alt={p.imageAlt}
            fill
            sizes="(min-width: 1024px) 40vw, 90vw"
            unoptimized={p.image.toLowerCase().endsWith(".svg")}
            className="object-cover"
          />
        </div>

        <div className="space-y-5">
          {p.eyebrow && (
            <p className="inline-flex rounded-full border border-ink-foreground/20 bg-ink-foreground/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider">
              {p.eyebrow}
            </p>
          )}
          <h2 className="text-2xl font-semibold sm:text-3xl">{p.title}</h2>
          {p.body && (
            <p className="text-base leading-relaxed text-ink-foreground/75">
              {p.body}
            </p>
          )}
          {p.points.length > 0 && (
            <ul className="space-y-2.5">
              {p.points.map((point, index) => (
                <li key={`${point}-${index}`} className="flex items-start gap-2.5 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                  <span className="leading-relaxed text-ink-foreground/90">{point}</span>
                </li>
              ))}
            </ul>
          )}
          {cta && <div className="pt-2">{cta}</div>}
        </div>
      </div>
    </section>
  );
}
