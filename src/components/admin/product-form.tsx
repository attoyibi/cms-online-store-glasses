"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { AlertCircle, Loader2 } from "lucide-react";

import {
  createProduct,
  updateProduct,
  type ActionState,
} from "@/app/admin/actions";
import { ImageUploader } from "@/components/admin/image-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Category, Product } from "@/lib/types";

const textareaClass =
  "flex w-full rounded-lg border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {pending ? "Menyimpan…" : label}
    </Button>
  );
}

export function ProductForm({
  categories,
  product,
}: {
  categories: Category[];
  product?: Product;
}) {
  const isEdit = Boolean(product);
  const [state, formAction] = useActionState<ActionState, FormData>(
    isEdit ? updateProduct : createProduct,
    {},
  );

  const specsText = product
    ? Object.entries(product.specs)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n")
    : "";

  return (
    <form action={formAction} className="space-y-6">
      {product && <input type="hidden" name="id" value={product.id} />}

      {state.error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {state.error}
        </p>
      )}

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold">Informasi Dasar</legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nama produk *</Label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={product?.name}
              placeholder="Arka Square Matte Black"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug URL</Label>
            <Input
              id="slug"
              name="slug"
              defaultValue={product?.slug}
              placeholder="Dikosongkan = dibuat dari nama"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand">Merek</Label>
            <Input
              id="brand"
              name="brand"
              defaultValue={product?.brand ?? ""}
              placeholder="Lensara Studio"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category_id">Kategori</Label>
            <select
              id="category_id"
              name="category_id"
              defaultValue={product?.category_id ?? ""}
              className="h-9 w-full rounded-lg border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="">— Tanpa kategori —</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Deskripsi</Label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={product?.description ?? ""}
            placeholder="Jelaskan bahan, bentuk, dan untuk siapa produk ini cocok."
            className={textareaClass}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-4 border-t pt-6">
        <legend className="text-sm font-semibold">Harga & Stok</legend>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="price">Harga jual (Rp) *</Label>
            <Input
              id="price"
              name="price"
              inputMode="numeric"
              required
              defaultValue={product?.price}
              placeholder="385000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="compare_at_price">Harga coret (Rp)</Label>
            <Input
              id="compare_at_price"
              name="compare_at_price"
              inputMode="numeric"
              defaultValue={product?.compare_at_price ?? ""}
              placeholder="Kosongkan bila tidak diskon"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">Stok (pcs)</Label>
            <Input
              id="stock"
              name="stock"
              inputMode="numeric"
              defaultValue={product?.stock ?? 0}
              placeholder="0"
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4 border-t pt-6">
        <legend className="text-sm font-semibold">Gambar</legend>
        <ImageUploader name="images" defaultValue={product?.images ?? []} />
      </fieldset>

      <fieldset className="space-y-4 border-t pt-6">
        <legend className="text-sm font-semibold">Spesifikasi</legend>
        <div className="space-y-2">
          <Label htmlFor="specs">Satu baris per spesifikasi</Label>
          <textarea
            id="specs"
            name="specs"
            rows={6}
            defaultValue={specsText}
            placeholder={"Material: Asetat premium\nBentuk: Persegi\nBerat: 24 gram"}
            className={`${textareaClass} font-mono text-xs`}
          />
          <p className="text-xs text-muted-foreground">
            Format <code className="font-mono">Nama: Nilai</code>. Baris tanpa
            titik dua akan diabaikan.
          </p>
        </div>
      </fieldset>

      <fieldset className="space-y-3 border-t pt-6">
        <legend className="text-sm font-semibold">Status</legend>

        <label className="flex items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={product?.is_active ?? true}
            className="size-4 rounded border-input accent-primary"
          />
          Tampilkan di katalog
        </label>

        <label className="flex items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            name="is_featured"
            defaultChecked={product?.is_featured ?? false}
            className="size-4 rounded border-input accent-primary"
          />
          Tandai unggulan (muncul di bagian &ldquo;Best seller&rdquo;)
        </label>
      </fieldset>

      <div className="flex gap-3 border-t pt-6">
        <SubmitButton label={isEdit ? "Simpan Perubahan" : "Tambah Produk"} />
        <Button asChild variant="ghost">
          <Link href="/admin/produk">Batal</Link>
        </Button>
      </div>
    </form>
  );
}
