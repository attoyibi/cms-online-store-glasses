"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

import type { ActionState } from "@/app/admin/actions";
import { savePalette } from "@/app/admin/tampilan/actions";
import { ThemePicker } from "@/components/admin/theme-picker";
import { Button } from "@/components/ui/button";

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled}>
      {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {pending ? "Menyimpan…" : "Simpan Warna"}
    </Button>
  );
}

/** Palet warna + penyesuaian per komponen, disimpan terpisah dari tema */
export function PaletteForm({
  initialTheme,
  initialColors,
  disabled,
}: {
  initialTheme: string | null;
  initialColors: Record<string, string>;
  /** Pengaturan toko belum diisi atau kolom database belum ada */
  disabled: boolean;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    savePalette,
    {},
  );

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      {state.error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {state.error}
        </p>
      )}
      {state.success && (
        <p
          role="status"
          className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm text-primary"
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {state.success}
        </p>
      )}

      <ThemePicker initialTheme={initialTheme} initialColors={initialColors} />

      <div className="border-t pt-5">
        <SubmitButton disabled={disabled} />
      </div>
    </form>
  );
}
