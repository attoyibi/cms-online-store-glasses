"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { AlertCircle, Loader2 } from "lucide-react";

import { saveCategory, type ActionState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Category } from "@/lib/types";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {pending ? "Menyimpan…" : label}
    </Button>
  );
}

export function CategoryForm({ category }: { category?: Category }) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    saveCategory,
    {},
  );

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      {category && <input type="hidden" name="id" value={category.id} />}

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
        <Label htmlFor="name">Nama kategori *</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={category?.name}
          placeholder="Kacamata Pria"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug URL</Label>
        <Input
          id="slug"
          name="slug"
          defaultValue={category?.slug}
          placeholder="Dikosongkan = dibuat dari nama"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi singkat</Label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={category?.description ?? ""}
          placeholder="Muncul di kartu kategori pada halaman depan."
          className="flex w-full rounded-lg border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="image_url">URL gambar</Label>
          <Input
            id="image_url"
            name="image_url"
            defaultValue={category?.image_url ?? ""}
            placeholder="/products/square-ink.svg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sort_order">Urutan tampil</Label>
          <Input
            id="sort_order"
            name="sort_order"
            inputMode="numeric"
            defaultValue={category?.sort_order ?? 0}
            placeholder="0"
          />
        </div>
      </div>

      <label className="flex items-center gap-2.5 text-sm">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={category?.is_active ?? true}
          className="size-4 rounded border-input accent-primary"
        />
        Tampilkan di situs
      </label>

      <div className="flex gap-3 border-t pt-5">
        <SubmitButton label={category ? "Simpan Perubahan" : "Tambah Kategori"} />
        <Button asChild variant="ghost">
          <Link href="/admin/kategori">Batal</Link>
        </Button>
      </div>
    </form>
  );
}
