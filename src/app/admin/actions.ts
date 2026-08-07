"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { slugify } from "@/lib/format";
import { requireAdmin } from "@/lib/supabase/admin";
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
    return { error: "Email atau password salah." };
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

function productPayload(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
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
    price: price ?? 0,
    compare_at_price: compareAt,
    stock: toNumber(formData.get("stock")) ?? 0,
    images,
    category_id: String(formData.get("category_id") ?? "") || null,
    is_active: formData.get("is_active") === "on",
    is_featured: formData.get("is_featured") === "on",
    specs: parseSpecs(String(formData.get("specs") ?? "")),
  };
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

  const invalid = validateProduct(payload);
  if (invalid) return { error: invalid };

  const { error } = await supabase.from("products").insert(payload);
  if (error) {
    return {
      error:
        error.code === "23505"
          ? "Slug sudah dipakai produk lain."
          : `Gagal menyimpan: ${error.message}`,
    };
  }

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
          : `Gagal menyimpan: ${error.message}`,
    };
  }

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
          : `Gagal menyimpan: ${error.message}`,
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

  if (error) return { error: `Gagal menyimpan: ${error.message}` };

  revalidateShop();
  return { success: "Pengaturan tersimpan." };
}
