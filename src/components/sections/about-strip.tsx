import Image from "next/image";

import { WhatsAppButton } from "@/components/whatsapp-button";
import { withDefaults } from "@/lib/blocks/registry";
import type { AboutProps } from "@/lib/blocks/types";
import { cn } from "@/lib/utils";

export function AboutStrip(props: Partial<AboutProps>) {
  const p = withDefaults("about", props);

  return (
    <section className="container-page py-16 sm:py-20">
      <div className="grid items-center gap-10 rounded-3xl border bg-sand p-6 sm:p-10 lg:grid-cols-2 lg:gap-14 lg:p-14">
        <div
          className={cn(
            "relative order-last aspect-4/3 overflow-hidden rounded-2xl bg-muted",
            p.imagePosition === "kanan" ? "lg:order-last" : "lg:order-first",
          )}
        >
          {p.image && (
            <Image
              src={p.image}
              alt={p.imageAlt}
              fill
              sizes="(min-width: 1024px) 40vw, 90vw"
              unoptimized={p.image.toLowerCase().endsWith(".svg")}
              className="object-cover"
            />
          )}
        </div>

        <div className="space-y-5">
          {p.eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              {p.eyebrow}
            </p>
          )}
          <h2 className="text-2xl font-semibold sm:text-3xl">{p.title}</h2>
          {p.body && (
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              {p.body}
            </p>
          )}

          {p.points.length > 0 && (
            <ul className="space-y-2.5 pt-1">
              {p.points.map((point, index) => (
                <li key={`${point}-${index}`} className="flex items-start gap-2.5 text-sm">
                  <span
                    className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
                    aria-hidden="true"
                  />
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          )}

          {p.ctaLabel && (
            <div className="pt-3">
              <WhatsAppButton
                variant="default"
                message={p.ctaMessage}
                label={p.ctaLabel}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
