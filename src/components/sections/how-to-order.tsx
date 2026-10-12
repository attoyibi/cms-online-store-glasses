import { ICONS } from "@/components/blocks/icons";
import { withDefaults } from "@/lib/blocks/registry";
import type { HowToOrderProps } from "@/lib/blocks/types";

export function HowToOrder(props: Partial<HowToOrderProps>) {
  const p = withDefaults("how-to-order", props);

  return (
    <section className="container-page py-16 sm:py-20">
      <div className="max-w-2xl space-y-2.5">
        {p.eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            {p.eyebrow}
          </p>
        )}
        <h2 className="text-2xl font-semibold sm:text-3xl">{p.title}</h2>
        {p.description && (
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            {p.description}
          </p>
        )}
      </div>

      {p.steps.length > 0 && (
        <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {p.steps.map(({ icon, title, body }, index) => {
            const Icon = ICONS[icon];
            return (
              <li key={`${title}-${index}`} className="relative">
                {/* Garis penghubung antar langkah di layar lebar */}
                {index < p.steps.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute left-11 top-5 hidden h-px w-[calc(100%-1.5rem)] bg-border lg:block"
                  />
                )}

                <div className="relative space-y-3">
                  <span className="relative z-10 flex size-10 items-center justify-center rounded-xl border bg-card text-primary shadow-sm">
                    <Icon className="size-4.5" aria-hidden="true" />
                  </span>
                  <div className="space-y-1.5">
                    <p className="text-sm font-semibold">
                      <span className="mr-1.5 text-muted-foreground tabular-nums">
                        {index + 1}.
                      </span>
                      {title}
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {body}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
