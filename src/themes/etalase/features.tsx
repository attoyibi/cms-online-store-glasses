import { ICONS } from "@/components/blocks/icons";
import { withDefaults } from "@/lib/blocks/registry";
import type { TrustBarProps } from "@/lib/blocks/types";

/**
 * Deretan kartu fitur tema Etalase (blok "Bar keunggulan"). Bila diletakkan
 * tepat di bawah hero, kartunya menimpa tepi bawah hero.
 */
export function EtalaseFeatures(props: Partial<TrustBarProps>) {
  const { items } = withDefaults("trust-bar", props);
  if (items.length === 0) return null;

  return (
    <section className="relative z-10 pb-4 [.etalase-hero+&]:-mt-16 lg:[.etalase-hero+&]:-mt-24">
      <div className="container-page grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {items.map(({ icon, title, body }, index) => {
          const Icon = ICONS[icon];
          return (
            <div
              key={`${title}-${index}`}
              className="rounded-2xl border bg-card p-4 text-center shadow-lg shadow-black/5 sm:p-6"
            >
              <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <p className="mt-4 text-sm font-semibold sm:text-base">{title}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                {body}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
