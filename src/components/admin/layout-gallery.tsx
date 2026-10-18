"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { activateLayout } from "@/app/admin/tampilan/actions";
import { Button } from "@/components/ui/button";
import { LAYOUTS } from "@/lib/layouts";
import { cn } from "@/lib/utils";

/**
 * Galeri tema di Admin → Tampilan. "Aktifkan" langsung menyimpan; tiap tema
 * punya halaman depan sendiri, jadi berpindah tidak menghapus apa pun.
 */
export function LayoutGallery({
  activeLayout,
  disabled,
}: {
  activeLayout: string;
  /** Pengaturan toko belum diisi atau kolom database belum ada */
  disabled: boolean;
}) {
  const [active, setActive] = useState(activeLayout);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function activate(id: string) {
    setPendingId(id);
    startTransition(async () => {
      const result = await activateLayout(id);
      setPendingId(null);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setActive(id);
      toast.success(result.success ?? "Tema diaktifkan.");
    });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {LAYOUTS.map((layout) => {
        const isActive = layout.id === active;
        const pending = pendingId === layout.id;
        return (
          <div
            key={layout.id}
            className={cn(
              "flex flex-col gap-3 rounded-xl border p-4",
              isActive && "border-primary ring-2 ring-primary/30",
            )}
          >
            <Wireframe kind={layout.id} />

            <div className="space-y-1">
              <p className="flex items-center gap-2 text-base font-semibold">
                {layout.name}
                {isActive && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground">
                    <Check className="size-3" aria-hidden="true" />
                    Aktif
                  </span>
                )}
              </p>
              <p className="text-sm text-muted-foreground">{layout.description}</p>
            </div>

            <div className="mt-auto flex flex-wrap items-center gap-3 pt-1">
              <Button
                type="button"
                size="sm"
                variant={isActive ? "outline" : "default"}
                disabled={isActive || disabled || pendingId !== null}
                onClick={() => activate(layout.id)}
              >
                {pending && (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                )}
                {isActive ? "Sedang dipakai" : "Aktifkan"}
              </Button>
              {isActive && (
                <Link
                  href="/admin/halaman-depan"
                  className="text-sm text-primary underline underline-offset-2"
                >
                  Edit halaman depan
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Sketsa kasar susunan halaman, hanya sebagai gambaran di kartu tema */
function Wireframe({ kind }: { kind: string }) {
  const dark = kind === "etalase";
  return (
    <span
      aria-hidden="true"
      className="block space-y-1.5 overflow-hidden rounded-lg border bg-background p-2"
    >
      <span
        className={cn(
          "block h-2.5 rounded-sm",
          dark ? "bg-foreground/80" : "bg-muted-foreground/25",
        )}
      />
      {dark ? (
        <span className="grid grid-cols-2 gap-1.5 rounded-sm bg-foreground/80 p-2">
          <span className="space-y-1.5">
            <span className="block h-2 w-4/5 rounded-sm bg-background/70" />
            <span className="block h-2 w-3/5 rounded-sm bg-background/40" />
            <span className="block h-2.5 w-2/5 rounded-sm bg-primary" />
          </span>
          <span className="block h-12 rounded-sm bg-background/30" />
        </span>
      ) : (
        <span className="grid grid-cols-3 gap-1.5">
          <span className="block h-14 rounded-sm bg-accent" />
          <span className="block h-14 rounded-sm bg-secondary" />
          <span className="block h-14 rounded-sm bg-accent" />
        </span>
      )}
      <span className="grid grid-cols-4 gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "block h-6 rounded-sm",
              dark ? "bg-card shadow-[0_0_0_1px_var(--border)]" : "bg-muted",
            )}
          />
        ))}
      </span>
    </span>
  );
}
