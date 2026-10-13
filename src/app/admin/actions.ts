"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { slugify } from "@/lib/format";
import { parseSeoForm, type RawSeoForm } from "@/lib/seo-validate";
import { requireAdmin } from "@/lib/supabase/admin";
import { isSchemaMissing } from "@/lib/supabase/env";
import { describeAuthError, describeError } from "@/lib/supabase/errors";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error?: string; success?: string };

/** Segarkan seluruh halaman yang menampilkan produk/kategori */
function revalidateShop() {
  revalidatePath("/", "layout");
}

// ---------------------------------------------------------------- auth

export async function signIn(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  if (!supabase) {
    return { error: "Supabase belum dikonfigurasi. Isi dulu .env.local." };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    // Terlihat di Workers Logs; sengaja tanpa email/password
    console.error("[signIn]", error.code, error.status, error.message);
    return { error: describeAuthError(error) };
  }

  revalidatePath("/admin", "layout");
  redirect("/admin");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase?.auth.signOut();
  revalidatePath("/admin", "layout");
  redirect("/admin/login");
}

// ------------------------------------------------------------ products

/** Ubah nilai form menjadi angka; string kosong dianggap null */
function toNumber(value: FormDataEntryValue | null): number | null {
  const raw = String(value ?? "").replace(/\D/g, "");
  return raw ? Number(raw) : null;
}

function parseSpecs(raw: string): Record<string, string> {
  const specs: Record<string, string> = {};
  for (const line of raw.split("\n")) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    if (key && value) specs[key] = value;
  }
  return specs;
}

type VariantInput = {
  label: string;
  price: number;
  compare_at_price: number | null;
  stock: number;
  sort_order: number;
};

/**
 * Satu varian per baris: `Label | harga | stok | harga coret`.
 * Stok dan harga coret boleh dikosongkan. Baris kosong diabaikan.
 */
function parseVariants(raw: string): {
  variants: VariantInput[];
  error: string | null;
} {
  const variants: VariantInput[] = [];
  const seen = new Set<string>();
  const lines = raw.split("\n");

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index].trim();
    if (!line) continue;

    const [labelRaw, priceRaw, stockRaw, compareRaw] = line
      .split("|")
      .map((part) => part.trim());
    const label = labelRaw ?? "";
    const price = toNumber(priceRaw ?? null);
    const stock = toNumber(stockRaw ?? null) ?? 0;
    const compareAt = toNumber(compareRaw ?? null);
    const where = `Baris varian ${index + 1} ("${label || line}")`;

    if (!label) return { variants, error: `${where}: label wajib diisi.` };
    if (!price || price <= 0) {
      return {
        variants,
        error: `${where}: harga wajib diisi, format: Label | harga | stok.`,
      };
    }
    if (compareAt !== null && compareAt <= price) {
      return {
        variants,
        error: `${where}: harga coret harus lebih besar dari harga jual.`,
      };
    }
    if (seen.has(label.toLowerCase())) {
      return { variants, error: `${where}: label sudah dipakai di baris lain.` };
    }
    seen.add(label.toLowerCase());

    variants.push({
      label,
      price,
      compare_at_price: compareAt,
      stock,
      sort_order: variants.length + 1,
    });
  }

  return { variants, error: null };
}

function productPayload(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const { variants } = parseVariants(String(formData.get("variants") ?? ""));
  const price = toNumber(formData.get("price"));
  const compareAt = toNumber(formData.get("compare_at_price"));

  const images = String(formData.get("images") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    name,
    slug: slugInput ? slugify(slugInput) : slugify(name),
    brand: String(formData.get("brand") ?? "").trim() || null,
    description: String(formData.get("description") ?? "").trim() || null,
    // Produk bervarian: harga = termurah, stok = total. Nilai dari kolom
    // harga/stok di form diabaikan supaya katalog (urut & filter harga)
    // tidak menyimpang dari varian.
    price: variants.length
      ? Math.min(...variants.map((v) => v.price))
      : (price ?? 0),
    compare_at_price: variants.length ? null : compareAt,
    stock: variants.length
      ? variants.reduce((sum, v) => sum + v.stock, 0)
      : (toNumber(formData.get("stock")) ?? 0),
    images,
    category_id: String(formData.get("category_id") ?? "") || null,
    is_active: formData.get("is_active") === "on",
    is_featured: formData.get("is_featured") === "on",
    lens_width_mm: toNumber(formData.get("lens_width_mm")),
    specs: parseSpecs(String(formData.get("specs") ?? "")),
  };
}

/** Semua kotak centang atribut dikirim dengan nama yang sama */
function attributeIds(formData: FormData): string[] {
  return formData.getAll("attributes").map(String).filter(Boolean);
}

/**
 * Samakan daftar atribut produk dengan yang dicentang di form.
 * Dihapus dulu semuanya lalu dipasang ulang — lebih sederhana dan
 * aman daripada menghitung selisihnya, dan jumlah barisnya sedikit.
 */
async function syncAttributes(
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
  productId: string,
  ids: string[],
): Promise<string | null> {
  const { error: clearError } = await supabase
    .from("product_attribute_links")
    .delete()
    .eq("product_id", productId);

  // Tabelnya belum ada berarti migrasi v2 belum dijalankan — produk tetap
  // tersimpan, hanya atributnya diabaikan.
  if (clearError) return null;

  if (ids.length === 0) return null;

  const { error } = await supabase.from("product_attribute_links").insert(
    ids.map((attributeId) => ({
      product_id: productId,
      attribute_id: attributeId,
    })),
  );

  return error
    ? describeError(error, "Produk tersimpan, tapi atributnya gagal")
    : null;
}

/**
 * Samakan varian di database dengan isi form: tambah/ubah dulu, baru
 * hapus yang sudah tidak ada. Urutan ini disengaja — bila penyimpanan
 * gagal di tengah jalan, varian lama tidak hilang.
 */
async function syncVariants(
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
  productId: string,
  variants: VariantInput[],
): Promise<string | null> {
  const { data: existing, error: readError } = await supabase
    .from("product_variants")
    .select("id, label")
    .eq("product_id", productId);

  if (readError) {
    if (!isSchemaMissing(readError)) {
      return describeError(readError, "Produk tersimpan, tapi varian gagal");
    }
    // Tabelnya belum ada — migrasi v4 belum dijalankan
    return variants.length
      ? "Produk tersimpan, tapi varian belum bisa disimpan: jalankan supabase/setup.sql di SQL Editor dulu."
      : null;
  }

  if (variants.length > 0) {
    const { error } = await supabase.from("product_variants").upsert(
      variants.map((variant) => ({ ...variant, product_id: productId })),
      { onConflict: "product_id,label" },
    );
    if (error) return describeError(error, "Produk tersimpan, tapi varian gagal");
  }

  const keep = new Set(variants.map((variant) => variant.label));
  const staleIds = ((existing ?? []) as { id: string; label: string }[])
    .filter((row) => !keep.has(row.label))
    .map((row) => row.id);

  if (staleIds.length > 0) {
    const { error } = await supabase
      .from("product_variants")
      .delete()
      .in("id", staleIds);
    if (error) return describeError(error, "Varian lama gagal dihapus");
  }

  return null;
}

function validateProduct(
  payload: ReturnType<typeof productPayload>,
): string | null {
  if (!payload.name) return "Nama produk wajib diisi.";
  if (!payload.slug) return "Slug tidak valid — gunakan huruf dan angka.";
  if (payload.price <= 0) return "Harga harus lebih besar dari 0.";
  if (payload.compare_at_price && payload.compare_at_price <= payload.price) {
    return "Harga coret harus lebih besar dari harga jual.";
  }
  return null;
}

export async function createProduct(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const payload = productPayload(formData);
  const parsedVariants = parseVariants(String(formData.get("variants") ?? ""));
  if (parsedVariants.error) return { error: parsedVariants.error };

  const invalid = validateProduct(payload);
  if (invalid) return { error: invalid };

  const { data, error } = await supabase
    .from("products")
    .insert(payload)
    .select("id")
    .single();

  if (error || !data) {
    return {
      error:
        error?.code === "23505"
          ? "Slug sudah dipakai produk lain."
          : describeError(error),
    };
  }

  const attributeError = await syncAttributes(
    supabase,
    data.id as string,
    attributeIds(formData),
  );
  if (attributeError) return { error: attributeError };

  const variantError = await syncVariants(
    supabase,
    data.id as string,
    parsedVariants.variants,
  );
  if (variantError) return { error: variantError };

  revalidateShop();
  redirect("/admin/produk");
}

export async function updateProduct(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Produk tidak ditemukan." };

  const payload = productPayload(formData);
  const parsedVariants = parseVariants(String(formData.get("variants") ?? ""));
  if (parsedVariants.error) return { error: parsedVariants.error };

  const invalid = validateProduct(payload);
  if (invalid) return { error: invalid };

  const { error } = await supabase
    .from("products")
    .update(payload)
    .eq("id", id);

  if (error) {
    return {
      error:
        error.code === "23505"
          ? "Slug sudah dipakai produk lain."
          : describeError(error),
    };
  }

  const attributeError = await syncAttributes(
    supabase,
    id,
    attributeIds(formData),
  );
  if (attributeError) return { error: attributeError };

  const variantError = await syncVariants(supabase, id, parsedVariants.variants);
  if (variantError) return { error: variantError };

  revalidateShop();
  redirect("/admin/produk");
}

export async function deleteProduct(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await supabase.from("products").delete().eq("id", id);
  revalidateShop();
  redirect("/admin/produk");
}

/** Toggle cepat dari daftar produk, tanpa membuka form edit */
export async function toggleProductActive(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const next = formData.get("next") === "true";
  if (!id) return;

  await supabase.from("products").update({ is_active: next }).eq("id", id);
  revalidateShop();
}

// ---------------------------------------------------------- categories

function categoryPayload(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();

  return {
    name,
    slug: slugInput ? slugify(slugInput) : slugify(name),
    description: String(formData.get("description") ?? "").trim() || null,
    image_url: String(formData.get("image_url") ?? "").trim() || null,
    sort_order: toNumber(formData.get("sort_order")) ?? 0,
    is_active: formData.get("is_active") === "on",
  };
}

export async function saveCategory(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const payload = categoryPayload(formData);

  if (!payload.name) return { error: "Nama kategori wajib diisi." };
  if (!payload.slug) return { error: "Slug tidak valid." };

  const { error } = id
    ? await supabase.from("categories").update(payload).eq("id", id)
    : await supabase.from("categories").insert(payload);

  if (error) {
    return {
      error:
        error.code === "23505"
          ? "Slug sudah dipakai kategori lain."
          : describeError(error),
    };
  }

  revalidateShop();
  redirect("/admin/kategori");
}

export async function deleteCategory(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  // Produk yang memakai kategori ini akan ikut kehilangan kategorinya
  // (ON DELETE SET NULL di skema), bukan ikut terhapus.
  await supabase.from("categories").delete().eq("id", id);
  revalidateShop();
  redirect("/admin/kategori");
}

// ---------------------------------------------------------- attributes

const ATTRIBUTE_TYPES = ["bentuk", "material", "warna"] as const;

export async function saveAttribute(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const type = String(formData.get("type") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const swatch = String(formData.get("swatch_hex") ?? "").trim();

  if (!ATTRIBUTE_TYPES.includes(type as (typeof ATTRIBUTE_TYPES)[number])) {
    return { error: "Jenis atribut tidak dikenal." };
  }
  if (!name) return { error: "Nama wajib diisi." };

  const slug = slugInput ? slugify(slugInput) : slugify(name);
  if (!slug) return { error: "Slug tidak valid — gunakan huruf dan angka." };

  const payload = {
    type,
    name,
    slug,
    // Warna butuh kode hex untuk bulatan warnanya; jenis lain tidak
    swatch_hex: type === "warna" && swatch ? swatch : null,
    sort_order: toNumber(formData.get("sort_order")) ?? 0,
    is_active: formData.get("is_active") === "on",
  };

  const { error } = id
    ? await supabase.from("product_attributes").update(payload).eq("id", id)
    : await supabase.from("product_attributes").insert(payload);

  if (error) {
    return {
      error:
        error.code === "23505"
          ? `Slug "${slug}" sudah dipakai di jenis ${type}.`
          : describeError(error),
    };
  }

  revalidateShop();
  redirect("/admin/atribut");
}

export async function deleteAttribute(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  // Pemasangan ke produk ikut terhapus lewat ON DELETE CASCADE,
  // produknya sendiri tidak terpengaruh.
  await supabase.from("product_attributes").delete().eq("id", id);
  revalidateShop();
  redirect("/admin/atribut");
}

// ------------------------------------------------------------ settings

export async function saveSettings(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();

  const payload = {
    store_name: String(formData.get("store_name") ?? "").trim(),
    whatsapp_number: String(formData.get("whatsapp_number") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    instagram_url: String(formData.get("instagram_url") ?? "").trim() || null,
    open_hours: String(formData.get("open_hours") ?? "").trim() || null,
    announcement: String(formData.get("announcement") ?? "").trim() || null,
  };

  if (!payload.store_name) return { error: "Nama toko wajib diisi." };
  if (!payload.whatsapp_number) return { error: "Nomor WhatsApp wajib diisi." };

  const id = String(formData.get("id") ?? "");
  const { error } = id
    ? await supabase.from("store_settings").update(payload).eq("id", id)
    : await supabase.from("store_settings").insert(payload);

  if (error) return { error: describeError(error) };

  revalidateShop();
  return { success: "Pengaturan tersimpan." };
}

// ----------------------------------------------------------------- seo

export async function saveSeoSettings(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();

  const raw: RawSeoForm = {};
  for (const key of new Set(formData.keys())) {
    const values = formData
      .getAll(key)
      .filter((value): value is string => typeof value === "string");
    raw[key] = values.length > 1 ? values : values[0];
  }

  const parsed = parseSeoForm(raw);
  if (!parsed.ok) return { error: parsed.error };

  const id = String(formData.get("id") ?? "");
  const { error } = id
    ? await supabase.from("seo_settings").update(parsed.value).eq("id", id)
    : await supabase.from("seo_settings").insert(parsed.value);

  if (isSchemaMissing(error)) {
    return {
      error:
        "Tabel pengaturan SEO belum ada di database. Jalankan supabase/setup.sql versi terbaru di SQL Editor Supabase (aman dijalankan berulang), lalu simpan lagi.",
    };
  }
  if (error) return { error: describeError(error) };

  revalidateShop();
  return { success: "Pengaturan SEO tersimpan." };
}
