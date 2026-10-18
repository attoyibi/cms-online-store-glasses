"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { activateLayout } from "@/app/admin/tampilan/actions";
import { Button } from "@/components/ui/button";

/**
 * Bar melayang di halaman pratinjau tema: menjelaskan bahwa ini belum
 * diaktifkan, dengan tombol untuk mengaktifkannya atau kembali.
 */
export function ThemePreviewBar({
  layoutId,
  layoutName,
  activeName,
  isActive,
}: {
  layoutId: string;
  layoutName: string;
  activeName: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function activate() {
    startTransition(async () => {
      const result = await activateLayout(layoutId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result.success ?? "Tema diaktifkan.");
      router.push("/admin/tampilan");
    });
  }

  return (
    <div className="fixed inset-x-3 bottom-3 z-[70] flex justify-center sm:inset-x-0">
      <div className="flex w-full max-w-2xl flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-2xl border bg-card px-4 py-3 text-sm shadow-xl shadow-black/15">
        <p className="min-w-0 flex-1">
          <strong>Pratinjau tema {layoutName}</strong>
          <span className="block text-xs text-muted-foreground">
            {isActive
              ? "Tema ini sedang aktif di situs."
              : `Belum diaktifkan. Pengunjung masih melihat tema ${activeName}.`}
          </span>
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/tampilan">Kembali</Link>
          </Button>
          {!isActive && (
            <Button type="button" size="sm" onClick={activate} disabled={pending}>
              {pending && (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              )}
              Aktifkan tema ini
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
