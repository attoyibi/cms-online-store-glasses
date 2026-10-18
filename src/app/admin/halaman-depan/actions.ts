"use server";

import { revalidatePath } from "next/cache";

import { normalizeBlocks } from "@/lib/blocks/normalize";
import { defaultBlocksFor } from "@/lib/blocks/registry";
import { getLayout } from "@/lib/layouts";
import type { Block } from "@/lib/blocks/types";
import { requireAdmin } from "@/lib/supabase/admin";
import { isSchemaMissing } from "@/lib/supabase/env";
import { describeError } from "@/lib/supabase/errors";

export type EditorResult = {
  ok: boolean;
  message?: string;
  error?: string;
  /** Hanya diisi oleh `discardHomeDraft` */
  blocks?: Block[];
};

const SCHEMA_HINT =
  "Tabel halaman belum ada. Jalankan supabase/setup.sql di SQL Editor Supabase dulu.";

const MAX_JSON = 400_000;

/**
 * Data dari editor tidak dipercaya: selalu dibersihkan lewat `normalizeBlocks`
 * (jenis, panjang teks, tautan, gambar) sebelum disimpan, sehingga yang
 * tersimpan di database dan yang dirender publik selalu valid.
 */
function parseBlocks(json: string): { blocks: Block[] } | { error: string } {
  if (typeof json !== "string" || json.length > MAX_JSON) {
    return { error: "Data halaman terlalu besar." };
  }

  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    return { error: "Data halaman tidak terbaca." };
  }
  if (!Array.isArray(raw)) return { error: "Data halaman tidak valid." };

  return { blocks: normalizeBlocks(raw) };
}

function failure(error: { code?: string; message?: string }, prefix: string) {
  return {
    ok: false,
    error: isSchemaMissing(error) ? SCHEMA_HINT : describeError(error, prefix),
  } satisfies EditorResult;
}

/*
 * Id tata letak dikirim dari editor (di-bind di halaman) supaya simpan selalu
 * mendarat di halaman yang sedang dibuka, walau tata letak diganti di tab
 * lain. Tetap disaring lewat `getLayout`, jadi slug apa pun dari luar ditolak.
 */

/** Simpan sebagai draft — belum terlihat pengunjung */
export async function saveHomeDraft(
  layoutId: string,
  json: string,
): Promise<EditorResult> {
  const { supabase } = await requireAdmin();
  const { pageSlug } = getLayout(layoutId);

  const parsed = parseBlocks(json);
  if ("error" in parsed) return { ok: false, error: parsed.error };

  const { error } = await supabase
    .from("site_page_drafts")
    .upsert({ slug: pageSlug, blocks: parsed.blocks }, { onConflict: "slug" });

  if (error) return failure(error, "Draft gagal disimpan");
  return { ok: true, message: "Draft tersimpan. Belum terlihat pengunjung." };
}

/** Terbitkan: tampil di halaman depan. Draft ikut disamakan. */
export async function publishHome(
  layoutId: string,
  json: string,
): Promise<EditorResult> {
  const { supabase } = await requireAdmin();
  const { pageSlug } = getLayout(layoutId);

  const parsed = parseBlocks(json);
  if ("error" in parsed) return { ok: false, error: parsed.error };

  const { error } = await supabase
    .from("site_pages")
    .upsert(
      {
        slug: pageSlug,
        blocks: parsed.blocks,
        published_at: new Date().toISOString(),
      },
      { onConflict: "slug" },
    );
  if (error) return failure(error, "Gagal menerbitkan");

  // Draft disamakan agar editor tidak menampilkan "belum diterbitkan"
  const { error: draftError } = await supabase
    .from("site_page_drafts")
    .upsert({ slug: pageSlug, blocks: parsed.blocks }, { onConflict: "slug" });
  if (draftError) return failure(draftError, "Terbit, tapi draft gagal disamakan");

  revalidatePath("/", "layout");
  return { ok: true, message: "Berhasil diterbitkan. Halaman depan sudah berubah." };
}

/** Buang draft: kembali ke versi yang terbit (atau bawaan bila belum pernah terbit) */
export async function discardHomeDraft(layoutId: string): Promise<EditorResult> {
  const { supabase } = await requireAdmin();
  const layout = getLayout(layoutId);

  const { error } = await supabase
    .from("site_page_drafts")
    .delete()
    .eq("slug", layout.pageSlug);
  if (error) return failure(error, "Draft gagal dibuang");

  const { data } = await supabase
    .from("site_pages")
    .select("blocks")
    .eq("slug", layout.pageSlug)
    .maybeSingle();

  return {
    ok: true,
    message: "Perubahan dibuang. Kembali ke versi yang terbit.",
    blocks: data ? normalizeBlocks(data.blocks) : defaultBlocksFor(layout.id),
  };
}
