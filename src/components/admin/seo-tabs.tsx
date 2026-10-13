"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const tabs = [
  { href: "/admin/seo", label: "Situs & bisnis lokal", exact: true },
  { href: "/admin/seo/halaman", label: "Halaman" },
  { href: "/admin/seo/redirect", label: "Redirect" },
  { href: "/admin/seo/feed", label: "Feed Google" },
  { href: "/admin/seo/periksa", label: "Pemeriksa SEO" },
];

export function SeoTabs() {
  const pathname = usePathname();

  return (
    <nav aria-label="Bagian SEO" className="flex gap-1 overflow-x-auto border-b">
      {tabs.map(({ href, label, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm transition-colors",
              active
                ? "border-primary font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
