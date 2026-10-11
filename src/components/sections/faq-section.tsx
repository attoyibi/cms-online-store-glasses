import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { withDefaults } from "@/lib/blocks/registry";
import type { FaqProps } from "@/lib/blocks/types";

export function FaqSection(props: Partial<FaqProps>) {
  const p = withDefaults("faq", props);

  return (
    <section className="container-page py-16 sm:py-20">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="space-y-4">
          {p.eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              {p.eyebrow}
            </p>
          )}
          <h2 className="text-2xl font-semibold sm:text-3xl">{p.title}</h2>
          {p.description && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {p.description}
            </p>
          )}
          {p.ctaLabel && (
            <WhatsAppButton message={p.ctaMessage} label={p.ctaLabel} />
          )}
        </div>

        <Accordion type="single" collapsible className="w-full">
          {p.items.map((faq, index) => (
            <AccordionItem key={`${faq.q}-${index}`} value={`faq-${index}`}>
              <AccordionTrigger className="text-left text-sm font-medium">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
