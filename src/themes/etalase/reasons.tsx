import { ICONS } from "@/components/blocks/icons";
import { withDefaults } from "@/lib/blocks/registry";
import type { HowToOrderProps } from "@/lib/blocks/types";

/**
 * Blok "Cara pesan" digambar ulang di tema Etalase sebagai deretan kartu
 * alasan ("Kenapa memilih kami?"), tanpa nomor langkah.
 */
export function EtalaseReasons(props: Partial<HowToOrderProps>) {
  const p = withDefaults("how-to-order", props);

  return (
    <section className="container-page py-14 sm:py-20">
      <div className="mx-auto max-w-2xl space-y-3 text-center">
        {p.eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            {p.eyebrow}
          </p>
        )}
        <h2 className="text-2xl font-semibold sm:text-3xl">{p.title}</h2>
        {p.description && (
          <p className="text-base leading-relaxed text-muted-foreground">
            {p.description}
          </p>
        )}
      </div>

      {p.steps.length > 0 && (
        <ul className="mt-10 grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {p.steps.map(({ icon, title, body }, index) => {
            const Icon = ICONS[icon];
            return (
              <li
                key={`${title}-${index}`}
                className="flex gap-4 rounded-2xl border bg-card p-5 shadow-sm"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-semibold sm:text-base">{title}</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {body}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
