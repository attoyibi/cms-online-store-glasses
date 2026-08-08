"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { describeError } from "@/lib/supabase/errors";
import { cn } from "@/lib/utils";

const BUCKET = "product-images";
/** SVG sengaja tidak diizinkan karena bisa memuat skrip */
const ACCEPTED = ["image/png", "image/jpeg", "image/webp", "image/avif"];
const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Mengelola daftar URL gambar produk. Nilainya dikirim lewat satu input
 * tersembunyi berisi URL yang dipisah baris baru — sesuai yang dibaca
 * `productPayload` di actions.ts.
 */
export function ImageUploader({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue: string[];
}) {
  const [images, setImages] = useState<string[]>(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualUrl, setManualUrl] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;

    const supabase = createClient();
    if (!supabase) {
      setError("Supabase belum dikonfigurasi — tempel URL gambar manual.");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const uploaded: string[] = [];

      for (const file of Array.from(files)) {
        if (!ACCEPTED.includes(file.type)) {
          setError(`${file.name}: hanya PNG, JPG, WEBP, atau AVIF.`);
          continue;
        }
        if (file.size > MAX_BYTES) {
          setError(`${file.name}: ukuran melebihi 5 MB.`);
          continue;
        }

        const extension = file.name.split(".").pop() ?? "jpg";
        const path = `${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { cacheControl: "31536000", upsert: false });

        if (uploadError) {
          setError(describeError(uploadError, `${file.name} gagal diunggah`));
          continue;
        }

        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }

      if (uploaded.length) setImages((current) => [...current, ...uploaded]);
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function addManual() {
    const url = manualUrl.trim();
    if (!url) return;
    setImages((current) => [...current, url]);
    setManualUrl("");
  }

  return (
    <div className="space-y-4">
      <input type="hidden" name={name} value={images.join("\n")} />

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      {images.length > 0 && (
        <ul className="flex flex-wrap gap-3">
          {images.map((url, index) => (
            <li key={`${url}-${index}`} className="group relative">
              <div className="relative size-24 overflow-hidden rounded-xl border bg-muted">
                <Image
                  src={url}
                  alt={`Gambar ${index + 1}`}
                  fill
                  sizes="96px"
                  unoptimized
                  className="object-cover"
                />
              </div>

              {index === 0 && (
                <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                  Utama
                </span>
              )}

              <button
                type="button"
                onClick={() =>
                  setImages((current) => current.filter((_, i) => i !== index))
                }
                aria-label={`Hapus gambar ${index + 1}`}
                className="absolute -right-1.5 -top-1.5 flex size-6 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm transition-colors hover:bg-destructive hover:text-white"
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={fileInput}
          type="file"
          accept={ACCEPTED.join(",")}
          multiple
          onChange={(event) => handleFiles(event.target.files)}
          className="hidden"
          id="image-upload"
        />
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => fileInput.current?.click()}
          className={cn("gap-2", uploading && "opacity-70")}
        >
          {uploading ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <ImagePlus className="size-4" aria-hidden="true" />
          )}
          {uploading ? "Mengunggah…" : "Unggah Gambar"}
        </Button>
        <p className="text-xs text-muted-foreground">
          PNG/JPG/WEBP, maks 5 MB. Gambar pertama jadi thumbnail.
        </p>
      </div>

      <div className="flex gap-2">
        <Input
          value={manualUrl}
          onChange={(event) => setManualUrl(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addManual();
            }
          }}
          placeholder="atau tempel URL gambar, mis. /products/round-sand.svg"
          aria-label="URL gambar"
        />
        <Button type="button" variant="secondary" onClick={addManual}>
          <Plus className="size-4" aria-hidden="true" />
          <span className="sr-only">Tambah URL</span>
        </Button>
      </div>
    </div>
  );
}
