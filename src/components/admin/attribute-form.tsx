"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { AlertCircle, Loader2 } from "lucide-react";

import { saveAttribute, type ActionState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AttributeType, ProductAttribute } from "@/lib/types";

const TYPES: { value: AttributeType; label: string }[] = [
  { value: "bentuk", label: "Bentuk frame" },
  { value: "material", label: "Material" },
  { value: "warna", label: "Warna" },
];

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {pending ? "Menyimpan…" : label}
    </Button>
  );
}

export function AttributeForm({
  attribute,
  defaultType = "bentuk",
}: {
  attribute?: ProductAttribute;
  defaultType?: AttributeType;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    saveAttribute,
    {},
  );
  const [type, setType] = useState<AttributeType>(attribute?.type ?? defaultType);

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      {attribute && <input type="hidden" name="id" value={attribute.id} />}

      {state.error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {state.error}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="type">Jenis *</Label>
        <select
          id="type"
          name="type"
          value={type}
          onChange={(event) => setType(event.target.value as AttributeType)}
          className="h-9 w-full rounded-lg border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {TYPES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {type === "bentuk" && (
          <p className="text-xs text-muted-foreground">
            Ikon bentuk hanya tersedia untuk slug bawaan: bundar, kotak,
            persegi-panjang, cat-eye, aviator, browline. Slug lain tetap bisa
            difilter, hanya tampil tanpa ikon.
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nama *</Label>
          <Input
            id="name"
            name="name"
            required
            defaultValue={attribute?.name}
            placeholder="Bundar"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            name="slug"
            defaultValue={attribute?.slug}
            placeholder="Dikosongkan = dibuat dari nama"
          />
        </div>
      </div>

      {type === "warna" && (
        <div className="space-y-2">
          <Label htmlFor="swatch_hex">Kode warna</Label>
          <div className="flex gap-2">
            <Input
              id="swatch_hex"
              name="swatch_hex"
              defaultValue={attribute?.swatch_hex ?? "#1F2421"}
              placeholder="#1F2421"
              className="font-mono"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Ditampilkan sebagai bulatan warna di filter katalog.
          </p>
        </div>
      )}

      <div className="max-w-32 space-y-2">
        <Label htmlFor="sort_order">Urutan</Label>
        <Input
          id="sort_order"
          name="sort_order"
          inputMode="numeric"
          defaultValue={attribute?.sort_order ?? 0}
        />
      </div>

      <label className="flex items-center gap-2.5 text-sm">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={attribute?.is_active ?? true}
          className="size-4 rounded border-input accent-primary"
        />
        Tampilkan sebagai opsi filter
      </label>

      <div className="flex gap-3 border-t pt-5">
        <SubmitButton label={attribute ? "Simpan Perubahan" : "Tambah Atribut"} />
        <Button asChild variant="ghost">
          <Link href="/admin/atribut">Batal</Link>
        </Button>
      </div>
    </form>
  );
}
