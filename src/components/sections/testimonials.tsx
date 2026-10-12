import { Star } from "lucide-react";

import { withDefaults } from "@/lib/blocks/registry";
import type { TestimonialsProps } from "@/lib/blocks/types";

export function Testimonials(props: Partial<TestimonialsProps>) {
  const p = withDefaults("testimonials", props);

  return (
    <section className="container-page py-16 sm:py-20">
      <div className="max-w-2xl space-y-2.5">
        {p.eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            {p.eyebrow}
          </p>
        )}
        <h2 className="text-2xl font-semibold sm:text-3xl">{p.title}</h2>
      </div>

      {p.reviews.length > 0 && (
        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {p.reviews.map((review, index) => (
            <figure
              key={`${review.name}-${index}`}
              className="flex flex-col rounded-2xl border bg-card p-6 shadow-sm"
            >
              <div className="flex gap-0.5" aria-label="Penilaian 5 dari 5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className="size-3.5 fill-primary text-primary"
                    aria-hidden="true"
                  />
                ))}
              </div>

              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                {review.body}
              </blockquote>

              <figcaption className="mt-5 border-t pt-4 text-sm">
                <span className="font-medium">{review.name}</span>
                {review.city && (
                  <span className="text-muted-foreground"> — {review.city}</span>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}
