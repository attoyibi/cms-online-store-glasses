"use client";

import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SEO_DESC_GOOD,
  SEO_DESC_MAX,
  SEO_TITLE_MAX,
  clipText,
  descriptionState,
  fullTitle,
  titleState,
  type LengthState,
} from "@/lib/seo-meta";
import { cn } from "@/lib/utils";

/** Bekal dari server untuk pratinjau: alamat situs dan nama toko */
export type SeoContext = { siteUrl: string; storeName: string };

const STATE_STYLE: Record<LengthState, string> = {
  kosong: "text-muted-foreground",
  pendek: "text-amber-700",
  baik: "text-emerald-700",
  panjang: "text-amber-700",
};

const textareaClass =
  "flex w-full rounded-lg border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

/** Isi kotak yang sedang diketik di bagian lain form (mis. nama produk) */
function useWatchedValue(elementId: string | undefined, initial: string) {
  const [value, setValue] = useState(initial);

  useEffect(() => {
    if (!elementId) return;
    const el = document.getElementById(elementId) as
      | HTMLInputElement
      | HTMLTextAreaElement
      | null;
    if (!el) return;
    const sync = () => setValue(el.value);
    sync();
    el.addEventListener("input", sync);
    return () => el.removeEventListener("input", sync);
  }, [elementId]);

  return value;
}

/**
 * Isian “Tampilan di Google”: judul dan deskripsi khusus untuk mesin
 * pencari, dengan pratinjau langsung. Dikosongkan = otomatis dari nama dan
 * deskripsi yang sudah ada (ditunjukkan sebagai teks abu-abu di pratinjau).
 */
export function SeoSnippetFields({
  context,
  path,
  defaultTitle,
  defaultDescription,
  autoTitle,
  autoDescription,
  watchTitleId,
  watchDescriptionId,
  columnsExist,
  idPrefix = "seo",
  absoluteTitle = false,
}: {
  context: SeoContext;
  /** Alamat halaman ini di situs, mis. /produk/arka-square */
  path: string;
  defaultTitle: string | null;
  defaultDescription: string | null;
  /** Judul/deskripsi otomatis bila dikosongkan */
  autoTitle: string;
  autoDescription: string;
  /** id kotak form yang menjadi sumber judul/deskripsi otomatis */
  watchTitleId?: string;
  watchDescriptionId?: string;
  /** Kolom seo_* sudah ada di database (form edit membacanya dari baris) */
  columnsExist: boolean;
  idPrefix?: string;
  /** Judul tampil apa adanya, tanpa “| nama toko” (beranda) */
  absoluteTitle?: boolean;
}) {
  const [title, setTitle] = useState(defaultTitle ?? "");
  const [description, setDescription] = useState(defaultDescription ?? "");
  const watchedTitle = useWatchedValue(watchTitleId, autoTitle);
  const watchedDescription = useWatchedValue(watchDescriptionId, autoDescription);

  const shownTitle = title.trim() || watchedTitle.trim() || "Judul halaman";
  const shownDescription =
    description.trim() ||
    clipText(watchedDescription, 155) ||
    "Belum ada deskripsi — Google akan memilih sendiri potongan teks dari halaman.";
  const usingAuto = {
    title: !title.trim(),
    description: !description.trim(),
  };

  const host = context.siteUrl.replace(/^https?:\/\//, "");
  const crumbs = path
    .split("/")
    .filter(Boolean)
    .map((part) => part.replace(/-/g, " "))
    .join(" › ");

  const decorate = (value: string) =>
    absoluteTitle ? value : fullTitle(value, context.storeName);
  const tState = titleState(shownTitle, absoluteTitle ? "" : context.storeName);
  const dState = descriptionState(shownDescription);

  return (
    <div className="space-y-4">
      {columnsExist && <input type="hidden" name="seo_present" value="1" />}

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}_title`}>Judul untuk Google</Label>
        <Input
          id={`${idPrefix}_title`}
          name="seo_title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={SEO_TITLE_MAX}
          placeholder="Kosong = memakai nama"
        />
        <p className={cn("text-xs", STATE_STYLE[tState])}>
          {decorate(shownTitle).length} karakter
          {absoluteTitle ? "" : ` dengan “| ${context.storeName}”`} — tampil
          utuh sampai 60.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}_description`}>Deskripsi untuk Google</Label>
        <textarea
          id={`${idPrefix}_description`}
          name="seo_description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={SEO_DESC_MAX}
          placeholder="Kosong = memakai deskripsi di atas"
          className={textareaClass}
        />
        <p className={cn("text-xs", STATE_STYLE[dState])}>
          {shownDescription.length} karakter — ideal 70–{SEO_DESC_GOOD}.
          {usingAuto.description && " (otomatis)"}
        </p>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs font-medium text-muted-foreground">
          Pratinjau di hasil pencarian Google
        </p>
        <div className="rounded-lg border bg-background p-4">
          <p className="truncate text-xs text-muted-foreground">
            {host}
            {crumbs && ` › ${crumbs}`}
          </p>
          <p
            className={cn(
              "mt-0.5 line-clamp-2 text-lg leading-snug text-[#1a0dab] dark:text-[#8ab4f8]",
              usingAuto.title && "opacity-80",
            )}
          >
            {clipText(decorate(shownTitle), 60)}
          </p>
          <p
            className={cn(
              "mt-1 line-clamp-2 text-sm text-muted-foreground",
              usingAuto.description && "italic",
            )}
          >
            {clipText(shownDescription, SEO_DESC_GOOD)}
          </p>
        </div>
      </div>
    </div>
  );
}
