"use client";

import { useFormStatus } from "react-dom";
import { Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Tombol hapus dengan konfirmasi. Ditaruh di dalam <form action={...}>;
 * membatalkan submit bila pengguna menolak konfirmasi.
 */
export function DeleteButton({
  confirmMessage,
  label = "Hapus",
}: {
  confirmMessage: string;
  label?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) event.preventDefault();
      }}
      className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <Trash2 className="size-4" aria-hidden="true" />
      )}
      {label}
    </Button>
  );
}
