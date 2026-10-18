"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  Package,
  Palette,
  Search,
  Settings,
  SlidersHorizontal,
  Tags,
} from "lucide-react";

import { signOut } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Ringkasan", icon: LayoutDashboard, exact: true },
  { href: "/admin/halaman-depan", label: "Halaman Depan", icon: LayoutTemplate },
  { href: "/admin/produk", label: "Produk", icon: Package },
  { href: "/admin/kategori", label: "Kategori", icon: Tags },
  { href: "/admin/atribut", label: "Atribut Filter", icon: SlidersHorizontal },
  { href: "/admin/tampilan", label: "Tampilan", icon: Palette },
  { href: "/admin/pengaturan", label: "Pengaturan", icon: Settings },
  { href: "/admin/seo", label: "SEO & Toko", icon: Search },
];

export function AdminNav({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex items-center gap-2 px-2">
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
          </svg>
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-tight">Admin CMS</p>
          <p className="truncate text-xs text-muted-foreground">{email}</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-2 border-t pt-4">
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href="/" target="_blank">
            Lihat Situs
          </Link>
        </Button>
        <form action={signOut}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Keluar
          </Button>
        </form>
      </div>
    </div>
  );
}
