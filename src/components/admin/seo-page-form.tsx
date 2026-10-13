"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

import { saveSeoPage, type ActionState } from "@/app/admin/actions";
import { ImageUploader } from "@/components/admin/image-uploader";
import {
  SeoSnippetFields,
  type SeoContext,
} from "@/components/admin/seo-snippet";
import { Button } from "@/components/ui/button";
import type { SeoPage, SeoPageSlug } from "@/lib/types";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {pending ? "Menyimpan…" : "Simpan"}
    </Button>
  );
}

/** Satu halaman statis: judul, deskripsi, gambar bagikan, dan saklar sembunyikan */
export function SeoPageForm({
  slug,
  label,
  path,
  page,
  context,
  autoTitle,
  autoDescription,
  absoluteTitle = false,
}: {
  slug: SeoPageSlug;
  label: string;
  path: string;
  page: SeoPage | null;
  context: SeoContext;
  autoTitle: string;
  autoDescription: string;
  /** Beranda: judul tampil apa adanya, tanpa “| nama toko” */
  absoluteTitle?: boolean;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    saveSeoPage,
    {},
  );
  const [open, setOpen] = useState(false);

  return (
    <section className="rounded-xl border bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 p-5 text-left"
      >
        <span>
          <span className="block text-base font-semibold">{label}</span>
          <span className="block text-sm text-muted-foreground">
            {path}
            {page?.noindex && " · disembunyikan dari Google"}
            {!page?.noindex &&
              (page?.seo_title || page?.seo_description) &&
              " · judul/deskripsi khusus"}
          </span>
        </span>
        <span className="text-sm text-muted-foreground" aria-hidden="true">
          {open ? "Tutup" : "Atur"}
        </span>
      </button>

      {open && (
        <form action={formAction} className="space-y-5 border-t p-5">
          <input type="hidden" name="slug" value={slug} />

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

          <SeoSnippetFields
            idPrefix={slug}
            context={context}
            path={path === "/" ? "" : path}
            defaultTitle={page?.seo_title ?? null}
            defaultDescription={page?.seo_description ?? null}
            autoTitle={autoTitle}
            autoDescription={autoDescription}
            columnsExist
            absoluteTitle={absoluteTitle}
          />

          <div className="space-y-2">
            <p className="text-sm font-medium">Gambar saat tautan dibagikan</p>
            <ImageUploader
              name="og_image"
              defaultValue={page?.og_image ? [page.og_image] : []}
              single
            />
            <p className="text-xs text-muted-foreground">
              Kosong = memakai gambar bagikan situs. PNG/JPG, ideal 1200×630.
            </p>
          </div>

          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              name="noindex"
              defaultChecked={page?.noindex ?? false}
              className="mt-0.5 size-4 accent-primary"
            />
            <span>
              <span className="font-medium">
                Sembunyikan halaman ini dari Google
              </span>
              <br />
              <span className="text-muted-foreground">
                Halaman tetap bisa dibuka pengunjung, tapi tidak masuk hasil
                pencarian dan sitemap.
              </span>
            </span>
          </label>

          <SubmitButton />
        </form>
      )}
    </section>
  );
}
