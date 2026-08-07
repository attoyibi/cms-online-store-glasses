import { Headphones, PackageCheck, ShieldCheck, Store } from "lucide-react";

const items = [
  {
    icon: Store,
    title: "Toko fisik di Jogja",
    body: "Bisa datang langsung untuk coba frame dan cek mata.",
  },
  {
    icon: PackageCheck,
    title: "Kirim ke seluruh Indonesia",
    body: "Dikemas rapi, dilengkapi hard case dan lap microfiber.",
  },
  {
    icon: ShieldCheck,
    title: "Garansi 1 tahun",
    body: "Berlaku untuk kerusakan frame dan lapisan lensa.",
  },
  {
    icon: Headphones,
    title: "Dibantu sampai cocok",
    body: "Tanya apa saja lewat WhatsApp, dijawab orang asli.",
  },
];

export function TrustBar() {
  return (
    <section className="bg-ink bg-grain text-ink-foreground">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {items.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex gap-4">
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
        ))}
      </div>
    </section>
  );
}
