"use server";

import { revalidatePath } from "next/cache";

import type { ActionState } from "@/app/admin/actions";
import { LAYOUTS } from "@/lib/layouts";
import { requireAdmin } from "@/lib/supabase/admin";
import { describeError } from "@/lib/supabase/errors";
import { THEMES, sanitizeColors } from "@/lib/themes";

const NO_ROW =
  "Isi dan simpan dulu Pengaturan toko (nama dan nomor WhatsApp), baru atur tampilan di sini.";

const NO_COLUMN =
  "Fitur tampilan belum aktif di database. Jalankan supabase/setup.sql terbaru di SQL Editor Supabase (aman dijalankan berulang), lalu coba lagi.";

/**
 * Tampilan disimpan di baris tunggal store_settings. Baris itu sengaja tidak
 * dibuat dari sini: nilai bawaan tabel (nama "Toko Saya", WhatsApp kosong)
 * akan menimpa pengaturan awal situs sebelum pemiliknya sempat mengisinya.
 */
async function updateAppearance(fields: Record<string, unknown>): Promise<ActionState> {
  const { supabase } = await requireAdmin();

  const { data: row } = await supabase
    .from("store_settings")
    .select("id")
    .limit(1)
    .maybeSingle();
  if (!row) return { error: NO_ROW };

  const { error } = await supabase
    .from("store_settings")
    .update(fields)
    .eq("id", row.id);

  if (error) {
    const missingColumn =
      (error.code === "PGRST204" || error.code === "42703") &&
      /layout|theme/.test(error.message ?? "");
    return { error: missingColumn ? NO_COLUMN : describeError(error) };
  }

  revalidatePath("/", "layout");
  return {};
}

/** Aktifkan satu tema (tata letak). Halaman depan tema lain tidak disentuh. */
export async function activateLayout(layoutId: string): Promise<ActionState> {
  const layout = LAYOUTS.find((l) => l.id === layoutId && l.available);
  if (!layout) return { error: "Tema tidak dikenal atau belum tersedia." };

  const result = await updateAppearance({ layout: layout.id });
  if (result.error) return result;
  return { success: `Tema ${layout.name} sekarang aktif.` };
}

/** Simpan palet warna beserta penyesuaian per komponen */
export async function savePalette(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const themeId = String(formData.get("theme") ?? "");

  let colors: unknown = {};
  try {
    colors = JSON.parse(String(formData.get("theme_colors") ?? "{}"));
  } catch {
    return { error: "Pilihan warna tidak terbaca. Muat ulang halaman lalu coba lagi." };
  }

  const result = await updateAppearance({
    theme: THEMES.some((t) => t.id === themeId) ? themeId : null,
    theme_colors: sanitizeColors(colors),
  });
  if (result.error) return result;
  return { success: "Warna tersimpan." };
}
