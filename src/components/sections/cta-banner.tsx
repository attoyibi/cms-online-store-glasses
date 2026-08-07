import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/whatsapp-button";

export function CtaBanner() {
  return (
    <section className="container-page pb-4 pt-16 sm:pt-20">
      <div className="relative overflow-hidden rounded-3xl bg-ink bg-grain px-6 py-14 text-center text-ink-foreground sm:px-12 sm:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 left-1/2 size-80 -translate-x-1/2 rounded-full bg-primary/25 blur-3xl"
        />

        <div className="relative mx-auto max-w-xl space-y-4">
          <h2 className="text-2xl font-semibold sm:text-3xl">
            Belum yakin mau yang mana?
          </h2>
          <p className="text-sm leading-relaxed text-ink-foreground/70 sm:text-base">
            Kirim foto wajah Anda dan hasil periksa mata. Dalam beberapa menit
            kami balas dengan dua sampai tiga rekomendasi beserta alasannya.
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-3">
            <WhatsAppButton
              size="lg"
              variant="default"
              message="Halo {store}, tolong bantu carikan kacamata yang cocok untuk saya."
              label="Minta Rekomendasi"
            />
            <Button
              asChild
              size="lg"
              variant="outline"
              className="gap-2 border-ink-foreground/20 bg-transparent text-ink-foreground hover:bg-ink-foreground/10 hover:text-ink-foreground"
            >
              <Link href="/produk">
                Jelajahi Katalog
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
