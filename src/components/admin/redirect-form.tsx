"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

import { saveRedirect, type ActionState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {pending ? "Menyimpan…" : "Tambah pengalihan"}
    </Button>
  );
}

export function RedirectForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(
    saveRedirect,
    {},
  );

  return (
    <form action={formAction} className="space-y-4 rounded-xl border bg-card p-5">
      <h2 className="text-base font-semibold">Tambah pengalihan</h2>

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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="from_path">Alamat lama</Label>
          <Input
            id="from_path"
            name="from_path"
            required
            placeholder="/produk/nama-lama"
            autoComplete="off"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="to_path">Alihkan ke</Label>
          <Input
            id="to_path"
            name="to_path"
            required
            placeholder="/produk/nama-baru"
            autoComplete="off"
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Tulis path situs ini saja (diawali /). Alamat lengkap toko ini juga
        diterima dan dipangkas jadi path-nya; domain lain ditolak.
      </p>

      <SubmitButton />
    </form>
  );
}
