"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search } from "lucide-react";

import { CartButton } from "@/components/cart/cart-button";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { useStoreSettings } from "@/components/store-settings-provider";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { mainNav } from "@/lib/site-config";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SiteHeader({
  categories,
  layout,
}: {
  categories: Category[];
  /** Tema aktif; "etalase" memakai header gelap dengan tombol WhatsApp */
  layout?: string;
}) {
  const dark = layout === "etalase";
  // Tombol ikon di atas latar gelap
  const ghost = dark
    ? "text-ink-foreground hover:bg-ink-foreground/10 hover:text-ink-foreground"
    : "";
  const pathname = usePathname();
  const settings = useStoreSettings();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Menu mobile ditutup oleh <SheetClose> yang membungkus tiap link,
  // jadi tidak perlu efek tambahan yang memantau pathname.

  const navLinks = categories.length
    ? [
        { label: "Beranda", href: "/" },
        { label: "Semua Produk", href: "/produk" },
        ...categories.slice(0, 4).map((c) => ({
          label: c.name,
          href: `/kategori/${c.slug}`,
        })),
      ]
    : [...mainNav];

  return (
    <>
      {settings.announcement && (
        <div className="scope-announcement bg-ink px-4 py-2 text-center text-xs text-ink-foreground">
          {settings.announcement}
        </div>
      )}

      <header
        className={cn(
          "sticky top-0 z-50 border-b transition-colors duration-200",
          dark
            ? scrolled
              ? "border-ink-foreground/10 bg-ink/90 text-ink-foreground backdrop-blur-md"
              : "border-ink-foreground/10 bg-ink text-ink-foreground"
            : scrolled
              ? "border-border bg-background/85 backdrop-blur-md"
              : "border-transparent bg-background",
        )}
      >
        <div className="container-page flex h-16 items-center gap-3">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn("lg:hidden", ghost)}
                aria-label="Buka menu navigasi"
              >
                <Menu className="size-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-full gap-0 p-0 sm:max-w-xs">
              <SheetHeader className="border-b px-5 py-4">
                <SheetTitle className="text-left text-base">
                  {settings.store_name}
                </SheetTitle>
              </SheetHeader>

              <nav className="flex flex-col p-2">
                {navLinks.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted",
                        pathname === link.href
                          ? "bg-muted font-medium"
                          : "text-muted-foreground",
                      )}
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>

              <div className="mt-auto border-t p-5">
                <p className="text-xs text-muted-foreground">
                  {settings.open_hours}
                </p>
              </div>
            </SheetContent>
          </Sheet>

          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 rounded-sm outline-offset-4 focus-visible:outline-2 focus-visible:outline-ring"
          >
            <Logo />
            <span className="text-base font-semibold tracking-tight">
              {settings.store_name}
            </span>
          </Link>

          <nav className="ml-6 hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm transition-colors",
                  dark ? "hover:text-ink-foreground" : "hover:text-foreground",
                  pathname === link.href
                    ? dark
                      ? "font-medium text-ink-foreground"
                      : "font-medium text-foreground"
                    : dark
                      ? "text-ink-foreground/70"
                      : "text-muted-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-0.5">
            {dark && (
              <WhatsAppButton
                size="sm"
                variant="default"
                label="Konsultasi via WhatsApp"
                className="mr-2 hidden bg-whatsapp text-white hover:bg-whatsapp/90 sm:inline-flex"
              />
            )}
            <Button
              asChild
              variant="ghost"
              size="icon"
              aria-label="Cari produk"
              className={ghost}
            >
              <Link href="/produk">
                <Search className="size-5" aria-hidden="true" />
              </Link>
            </Button>
            <CartButton className={ghost} />
          </div>
        </div>
      </header>
    </>
  );
}

/** Monogram sederhana: dua lensa yang menyatu */
function Logo() {
  return (
    <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
      <svg
        viewBox="0 0 24 24"
        className="size-4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        aria-hidden="true"
      >
        <circle cx="6.5" cy="13" r="4" />
        <circle cx="17.5" cy="13" r="4" />
        <path d="M10.5 12.2c1-.8 2-.8 3 0" strokeLinecap="round" />
        <path d="M2.5 11.5 4 9M21.5 11.5 20 9" strokeLinecap="round" />
      </svg>
    </span>
  );
}
