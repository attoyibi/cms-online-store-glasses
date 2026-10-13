import Link from "next/link";
import { Clock, Mail, MapPin, MessageCircle } from "lucide-react";

import { InstagramIcon } from "@/components/icons";
import type { Category, StoreSettings } from "@/lib/types";
import { normalizeWaNumber, waLink } from "@/lib/whatsapp";

export function SiteFooter({
  categories,
  settings,
  description,
}: {
  categories: Category[];
  settings: StoreSettings;
  /** Deskripsi singkat toko, dari Admin → SEO & Toko */
  description: string;
}) {
  const waHref = waLink(
    settings.whatsapp_number,
    `Halo ${settings.store_name}, saya mau tanya-tanya dulu.`,
  );

  return (
    <footer className="mt-24 border-t bg-ink text-ink-foreground">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <p className="text-lg font-semibold tracking-tight">
            {settings.store_name}
          </p>
          <p className="max-w-xs text-sm leading-relaxed text-ink-foreground/70">
            {description}
          </p>
          <div className="flex gap-2 pt-1">
            <a
              href={waHref}
              target="_blank"
              rel="noreferrer"
              className="flex size-9 items-center justify-center rounded-lg border border-ink-foreground/15 transition-colors hover:bg-ink-foreground/10"
              aria-label="Hubungi lewat WhatsApp"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
            </a>
            {settings.instagram_url && (
              <a
                href={settings.instagram_url}
                target="_blank"
                rel="noreferrer"
                className="flex size-9 items-center justify-center rounded-lg border border-ink-foreground/15 transition-colors hover:bg-ink-foreground/10"
                aria-label="Instagram kami"
              >
                <InstagramIcon />
              </a>
            )}
          </div>
        </div>

        <nav aria-labelledby="footer-katalog" className="space-y-3">
          <p
            id="footer-katalog"
            className="text-xs font-semibold uppercase tracking-wider text-ink-foreground/50"
          >
            Katalog
          </p>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link
                href="/produk"
                className="text-ink-foreground/75 transition-colors hover:text-ink-foreground"
              >
                Semua Produk
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/kategori/${category.slug}`}
                  className="text-ink-foreground/75 transition-colors hover:text-ink-foreground"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-bantuan" className="space-y-3">
          <p
            id="footer-bantuan"
            className="text-xs font-semibold uppercase tracking-wider text-ink-foreground/50"
          >
            Bantuan
          </p>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link
                href="/cara-pesan"
                className="text-ink-foreground/75 transition-colors hover:text-ink-foreground"
              >
                Cara Pesan
              </Link>
            </li>
            <li>
              <Link
                href="/tentang"
                className="text-ink-foreground/75 transition-colors hover:text-ink-foreground"
              >
                Tentang Kami
              </Link>
            </li>
            <li>
              <a
                href={waHref}
                target="_blank"
                rel="noreferrer"
                className="text-ink-foreground/75 transition-colors hover:text-ink-foreground"
              >
                Konsultasi Gratis
              </a>
            </li>
          </ul>
        </nav>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-foreground/50">
            Kontak
          </p>
          <ul className="space-y-3 text-sm text-ink-foreground/75">
            {settings.address && (
              <li className="flex gap-2.5">
                <MapPin
                  className="mt-0.5 size-4 shrink-0 text-ink-foreground/45"
                  aria-hidden="true"
                />
                <span className="leading-relaxed">{settings.address}</span>
              </li>
            )}
            <li className="flex gap-2.5">
              <MessageCircle
                className="mt-0.5 size-4 shrink-0 text-ink-foreground/45"
                aria-hidden="true"
              />
              <a
                href={waHref}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-ink-foreground"
              >
                +{normalizeWaNumber(settings.whatsapp_number)}
              </a>
            </li>
            {settings.email && (
              <li className="flex gap-2.5">
                <Mail
                  className="mt-0.5 size-4 shrink-0 text-ink-foreground/45"
                  aria-hidden="true"
                />
                <a
                  href={`mailto:${settings.email}`}
                  className="transition-colors hover:text-ink-foreground"
                >
                  {settings.email}
                </a>
              </li>
            )}
            {settings.open_hours && (
              <li className="flex gap-2.5">
                <Clock
                  className="mt-0.5 size-4 shrink-0 text-ink-foreground/45"
                  aria-hidden="true"
                />
                <span>{settings.open_hours}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-ink-foreground/10">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-ink-foreground/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {settings.store_name}. Semua hak
            dilindungi.
          </p>
          <p>
            Pemesanan diproses lewat WhatsApp — situs ini tidak menyimpan data
            pembayaran.
          </p>
        </div>
      </div>
    </footer>
  );
}
