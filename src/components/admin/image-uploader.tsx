"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ImageCropper, MAX_SOURCE_BYTES } from "@/components/admin/image-cropper";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { describeError } from "@/lib/supabase/errors";
import { cn } from "@/lib/utils";

const BUCKET = "product-images";
/** SVG sengaja tidak diizinkan karena bisa memuat skrip */
const ACCEPTED = ["image/png", "image/jpeg", "image/webp", "image/avif"];

/**
 * Mengelola daftar URL gambar produk. Nilainya dikirim lewat satu input
 * tersembunyi berisi URL yang dipisah baris baru — sesuai yang dibaca
 * `productPayload` di actions.ts.
 */
export function ImageUploader({
  name,
  defaultValue,
  onChange,
  single = false,
  altName,
  defaultAlts,
  altsColumnExists = false,
  altFallback,
  aspect = 1,
  outputWidth = 1200,
}: {
  name: string;
  /** Rasio bingkai hasil (lebar / tinggi), mis. 1 = persegi, 1200/630 = gambar bagikan */
  aspect?: number;
  /** Lebar hasil akhir dalam piksel */
  outputWidth?: number;
  defaultValue: string[];
  /** Dipanggil setiap daftar gambar berubah — untuk dipakai sebagai input terkontrol */
  onChange?: (images: string[]) => void;
  /** Hanya satu gambar: unggahan atau URL baru menggantikan yang lama */
  single?: boolean;
  /**
   * Nama kolom form untuk teks alternatif foto (JSON { url: teks }). Bila
   * diisi, tiap foto mendapat kotak teks alternatif.
   */
  altName?: string;
  defaultAlts?: Record<string, string>;
  /** Kolom image_alts sudah ada di database (terdeteksi dari baris produk) */
  altsColumnExists?: boolean;
  /** Teks yang dipakai bila kotak dikosongkan, mis. nama produk */
  altFallback?: string;
}) {
  const inputId = useId();
  const [images, setImagesState] = useState<string[]>(defaultValue);
  const [alts, setAlts] = useState<Record<string, string>>(defaultAlts ?? {});
  const latest = useRef<string[]>(defaultValue);

  function setImages(next: string[]) {
    latest.current = next;
    setImagesState(next);
    onChange?.(next);
  }

  /** Gabungkan gambar baru ke daftar; mode single menggantikan seluruhnya */
  function addImages(added: string[]) {
    setImages(single ? added.slice(0, 1) : [...latest.current, ...added]);
  }
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualUrl, setManualUrl] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  /** Berkas yang lolos pemeriksaan dan menunggu diatur di dialog; yang pertama sedang dibuka */
  const [queue, setQueue] = useState<File[]>([]);

  function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);

    const accepted: File[] = [];
    const problems: string[] = [];
    for (const file of Array.from(files)) {
      if (!ACCEPTED.includes(file.type)) {
        problems.push(`${file.name}: hanya PNG, JPG, WEBP, atau AVIF.`);
      } else if (file.size > MAX_SOURCE_BYTES) {
        problems.push(
          `${file.name}: ${(file.size / 1024 / 1024).toFixed(1)} MB, melebihi 10 MB.`,
        );
      } else {
        accepted.push(file);
      }
    }
    if (problems.length) setError(problems.join(" "));
    // Mode single hanya memakai satu gambar
    setQueue(single ? accepted.slice(0, 1) : accepted);
    if (fileInput.current) fileInput.current.value = "";
  }

  /** Dipanggil dialog setelah gambar diatur: unggah hasilnya lalu lanjut ke berkas berikutnya */
  async function uploadCropped(file: File) {
    const supabase = createClient();
    if (!supabase) {
      setError("Supabase belum dikonfigurasi — tempel URL gambar manual.");
      setQueue([]);
      return;
    }

    setUploading(true);
    try {
      const path = `${crypto.randomUUID()}.webp`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
          cacheControl: "31536000",
          upsert: false,
          contentType: "image/webp",
        });

      if (uploadError) {
        setError(describeError(uploadError, "Gambar gagal diunggah"));
      } else {
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        addImages([data.publicUrl]);
      }
    } finally {
      setUploading(false);
      setQueue((current) => current.slice(1));
    }
  }

  function addManual() {
    const url = manualUrl.trim();
    if (!url) return;
    if (!/^(https:\/\/|\/(?!\/))/.test(url)) {
      setError("URL harus diawali https:// atau / (mis. /products/nama.webp).");
      return;
    }
    setError(null);
    addImages([url]);
    setManualUrl("");
  }

  const cropTitle =
    queue.length > 1 ? `Atur gambar (1 dari ${queue.length})` : "Atur gambar";

  return (
    <div className="space-y-4">
      <ImageCropper
        key={`${queue.length}-${queue[0]?.name}-${queue[0]?.size}`}
        file={queue[0] ?? null}
        aspect={aspect}
        outputWidth={outputWidth}
        title={cropTitle}
        onConfirm={uploadCropped}
        onCancel={() => setQueue((current) => current.slice(1))}
      />
      <input type="hidden" name={name} value={images.join("\n")} />
      {altName && (
        <>
          <input
            type="hidden"
            name={altName}
            value={JSON.stringify(
              Object.fromEntries(
                images
                  .filter((url) => alts[url]?.trim())
                  .map((url) => [url, alts[url]]),
              ),
            )}
          />
          {altsColumnExists && <input type="hidden" name="alts_present" value="1" />}
        </>
      )}

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      {images.length > 0 && (
        <ul className={altName ? "space-y-3" : "flex flex-wrap gap-3"}>
          {images.map((url, index) => (
            <li
              key={`${url}-${index}`}
              className={cn("group relative", altName && "flex items-start gap-3")}
            >
              <div className="relative size-24 shrink-0 overflow-hidden rounded-xl border bg-muted">
                <Image
                  src={url}
                  alt={`Gambar ${index + 1}`}
                  fill
                  sizes="96px"
                  unoptimized
                  className="object-cover"
                />
              </div>

              {index === 0 && !single && (
                <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                  Utama
                </span>
              )}

              <button
                type="button"
                onClick={() =>
                  setImages(latest.current.filter((_, i) => i !== index))
                }
                aria-label={`Hapus gambar ${index + 1}`}
                className="absolute -right-1.5 -top-1.5 flex size-6 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm transition-colors hover:bg-destructive hover:text-white"
              >
                <X className="size-3" aria-hidden="true" />
              </button>

              {altName && (
                <div className="min-w-0 flex-1 space-y-1 pt-1">
                  <label
                    htmlFor={`${inputId}-alt-${index}`}
                    className="text-xs font-medium"
                  >
                    Teks alternatif foto {index + 1}
                  </label>
                  <Input
                    id={`${inputId}-alt-${index}`}
                    value={alts[url] ?? ""}
                    maxLength={125}
                    onChange={(event) =>
                      setAlts((current) => ({ ...current, [url]: event.target.value }))
                    }
                    placeholder={
                      index === 0
                        ? altFallback || "Deskripsikan isi foto"
                        : `${altFallback || "Produk"} — foto ${index + 1}`
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Jelaskan yang terlihat di foto, mis. “Frame persegi hitam
                    tampak depan”. Dibaca pembaca layar dan dipakai Google Gambar.
                    Kosong = otomatis.
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={fileInput}
          type="file"
          accept={ACCEPTED.join(",")}
          multiple={!single}
          onChange={(event) => handleFiles(event.target.files)}
          className="hidden"
          id={inputId}
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
          {single
            ? "PNG/JPG/WEBP, maks 10 MB. Bisa digeser dan di-zoom sebelum disimpan."
            : "PNG/JPG/WEBP, maks 10 MB. Tiap gambar bisa digeser dan di-zoom dulu. Gambar pertama jadi thumbnail."}
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
          placeholder="atau tempel URL gambar (https://… atau /products/nama.webp)"
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
