import { ICONS } from "@/components/blocks/icons";
import { withDefaults } from "@/lib/blocks/registry";
import type { TrustBarProps } from "@/lib/blocks/types";

export function TrustBar(props: Partial<TrustBarProps>) {
  const { items } = withDefaults("trust-bar", props);
  if (items.length === 0) return null;

  return (
    <section className="bg-ink bg-grain text-ink-foreground">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {items.map(({ icon, title, body }, index) => {
          const Icon = ICONS[icon];
          return (
            <div key={`${title}-${index}`} className="flex gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-ink-foreground/15 bg-ink-foreground/5">
                <Icon className="size-4.5" aria-hidden="true" />
              </span>
              <div className="space-y-1">
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-sm leading-relaxed text-ink-foreground/60">
                  {body}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
