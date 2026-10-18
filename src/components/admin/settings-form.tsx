"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

import { saveSettings, type ActionState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemePicker } from "@/components/admin/theme-picker";
import { Label } from "@/components/ui/label";
import type { StoreSettings } from "@/lib/types";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {pending ? "Menyimpan…" : "Simpan Pengaturan"}
    </Button>
  );
}

export function SettingsForm({
  settings,
  themeReady,
}: {
  settings: StoreSettings;
  /** Kolom tema sudah ada di database (setup.sql v10 sudah dijalankan) */
  themeReady: boolean;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    saveSettings,
    {},
  );

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      <input type="hidden" name="id" value={settings.id} />

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

      <div className="space-y-2">
        <Label htmlFor="store_name">Nama toko *</Label>
        <Input
          id="store_name"
          name="store_name"
          required
          defaultValue={settings.store_name}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="whatsapp_number">Nomor WhatsApp *</Label>
        <Input
          id="whatsapp_number"
          name="whatsapp_number"
          required
          defaultValue={settings.whatsapp_number}
          placeholder="6289679165530"
        />
        <p className="text-xs text-muted-foreground">
          Boleh ditulis 08xx, 62xx, atau +62 — sistem menormalkan sendiri.
          Semua pesanan dari situs akan masuk ke nomor ini.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Alamat toko</Label>
        <textarea
          id="address"
          name="address"
          rows={2}
          defaultValue={settings.address ?? ""}
          className="flex w-full rounded-lg border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={settings.email ?? ""}
            placeholder="halo@lensara.id"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="instagram_url">URL Instagram</Label>
          <Input
            id="instagram_url"
            name="instagram_url"
            type="url"
            defaultValue={settings.instagram_url ?? ""}
            placeholder="https://instagram.com/lensara"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="open_hours">Jam buka</Label>
        <Input
          id="open_hours"
          name="open_hours"
          defaultValue={settings.open_hours ?? ""}
          placeholder="Setiap hari, 09.00 - 21.00 WIB"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="announcement">Pengumuman</Label>
        <Input
          id="announcement"
          name="announcement"
          defaultValue={settings.announcement ?? ""}
          placeholder="Gratis ongkir se-Jawa untuk pembelian di atas Rp500.000"
        />
        <p className="text-xs text-muted-foreground">
          Muncul sebagai bar tipis di paling atas situs. Kosongkan untuk
          menyembunyikannya.
        </p>
      </div>

      <div className="border-t pt-5">
        {themeReady ? (
          <ThemePicker
            initialTheme={settings.theme ?? null}
            initialColors={settings.theme_colors ?? {}}
          />
        ) : (
          <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
            Pilihan tema warna belum aktif. Jalankan{" "}
            <code className="font-mono">supabase/setup.sql</code> versi terbaru
            di SQL Editor Supabase (aman dijalankan berulang), lalu muat ulang
            halaman ini.
          </p>
        )}
      </div>

      <div className="border-t pt-5">
        <SubmitButton />
      </div>
    </form>
  );
}
