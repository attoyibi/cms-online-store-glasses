import { ICON_NAMES } from "@/lib/blocks/icon-names";
import { BLOCK_DEFS, defaultPropsOf } from "@/lib/blocks/registry";
import {
  DEFAULT_TEXTAREA_MAX,
  DEFAULT_TEXT_MAX,
  MAX_BLOCKS,
  type Field,
} from "@/lib/blocks/schema";
import type { Block, BlockPropsMap, BlockType } from "@/lib/blocks/types";
import { SUPABASE_URL } from "@/lib/supabase/env";

/**
 * Satu-satunya pintu masuk data blok — dari database maupun dari editor.
 * Apa pun bentuk masukannya, keluarannya selalu `Block[]` yang valid:
 * jenis dikenal, kolom lengkap (kekurangan diisi bawaan), teks dibatasi
 * panjangnya, tautan dan gambar hanya yang aman. Data yang rusak atau
 * dimanipulasi tidak akan membuat halaman error.
 */

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const MAX_LINK = 500;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function clip(value: string, max: number): string {
  // Spread per code point supaya emoji tidak terpotong di tengah
  const chars = [...value];
  return chars.length > max ? chars.slice(0, max).join("") : value;
}

function cleanText(
  value: unknown,
  max: number,
  multiline: boolean,
): string | null {
  if (typeof value !== "string") return null;
  let text = value.replace(/\r\n?/g, "\n").replace(CONTROL_CHARS, "");
  if (!multiline) text = text.replace(/\n+/g, " ");
  return clip(text.trim(), max);
}

/** Path situs, anchor, atau URL http(s)/mailto/tel — bukan javascript:, data:, dsb. */
export function isSafeLink(value: string): boolean {
  if (value.length > MAX_LINK || /\s/.test(value)) return false;
  if (/^\/(?!\/)/.test(value)) return true;
  if (value.startsWith("#")) return true;
  return /^(https?:\/\/|mailto:|tel:)/i.test(value);
}

/**
 * Gambar yang boleh dipakai: file milik situs ("/products/x.svg") atau file
 * di Supabase Storage proyek ini. Host lain ditolak karena next/image tidak
 * mengizinkannya dan akan membuat halaman error saat dirender.
 */
export function isAllowedImage(value: string): boolean {
  if (value.length > MAX_LINK || /\s/.test(value)) return false;
  if (/^\/(?!\/)/.test(value)) return true;

  try {
    const url = new URL(value);
    const supabaseHost = SUPABASE_URL ? new URL(SUPABASE_URL).hostname : null;
    return (
      url.protocol === "https:" &&
      supabaseHost !== null &&
      url.hostname === supabaseHost &&
      url.pathname.startsWith("/storage/v1/object/public/")
    );
  } catch {
    return false;
  }
}

function sanitizeField(field: Field, raw: unknown, fallback: unknown): unknown {
  if (raw === undefined) return fallback;

  switch (field.kind) {
    case "text":
      return cleanText(raw, field.max ?? DEFAULT_TEXT_MAX, false) ?? fallback;

    case "textarea":
      return cleanText(raw, field.max ?? DEFAULT_TEXTAREA_MAX, true) ?? fallback;

    case "link": {
      if (typeof raw !== "string") return fallback;
      const link = raw.trim();
      return link === "" || isSafeLink(link) ? link : fallback;
    }

    case "image": {
      if (typeof raw !== "string") return fallback;
      const image = raw.trim();
      return image === "" || isAllowedImage(image) ? image : fallback;
    }

    case "select":
      return field.options.some((option) => option.value === raw)
        ? raw
        : fallback;

    case "number": {
      const number = typeof raw === "number" ? raw : Number(raw);
      if (!Number.isFinite(number)) return fallback;
      return Math.min(field.max, Math.max(field.min, Math.round(number)));
    }

    case "icon":
      return (ICON_NAMES as readonly unknown[]).includes(raw)
        ? raw
        : (fallback ?? "star");

    case "strings": {
      if (!Array.isArray(raw)) return fallback;
      return raw
        .map((item) => cleanText(item, DEFAULT_TEXT_MAX, false))
        .filter((item): item is string => Boolean(item))
        .slice(0, field.max);
    }

    case "list": {
      if (!Array.isArray(raw)) return fallback;
      const items: Record<string, unknown>[] = [];

      // Item kosong dibuang dulu baru dibatasi, supaya daftar bisa terisi penuh.
      // Batas 200 hanya agar masukan raksasa tidak membuang waktu.
      for (const entry of raw.slice(0, 200)) {
        if (items.length >= field.max) break;
        if (!isRecord(entry)) continue;
        const item: Record<string, unknown> = {};
        for (const sub of field.fields) {
          item[sub.name] = sanitizeField(
            sub,
            entry[sub.name],
            field.blank[sub.name] ?? "",
          );
        }
        // Buang item yang seluruh isi tulisannya kosong (sisa tombol "tambah")
        const hasContent = field.fields.some(
          (sub) => sub.kind !== "icon" && String(item[sub.name] ?? "") !== "",
        );
        if (hasContent) items.push(item);
      }
      return items;
    }
  }
}

export function normalizeProps<K extends BlockType>(
  type: K,
  raw: unknown,
): BlockPropsMap[K] {
  const definition = BLOCK_DEFS[type];
  const defaults = defaultPropsOf(type) as Record<string, unknown>;
  const source = isRecord(raw) ? raw : {};
  const result: Record<string, unknown> = { ...defaults };

  for (const field of definition.fields as Field[]) {
    result[field.name] = sanitizeField(
      field,
      source[field.name],
      defaults[field.name],
    );
  }

  return result as BlockPropsMap[K];
}

export function newBlockId(type: BlockType): string {
  return `${type}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Blok baru dengan isi bawaan jenisnya, siap ditambahkan ke halaman */
export function createBlock<K extends BlockType>(type: K): Block {
  return {
    id: newBlockId(type),
    type,
    hidden: false,
    props: defaultPropsOf(type),
  } as Block;
}

export function normalizeBlocks(raw: unknown): Block[] {
  if (!Array.isArray(raw)) return [];

  const seen = new Set<string>();
  const blocks: Block[] = [];

  for (const item of raw.slice(0, MAX_BLOCKS)) {
    if (!isRecord(item)) continue;

    const type = item.type;
    if (typeof type !== "string" || !Object.hasOwn(BLOCK_DEFS, type)) continue;

    let id =
      typeof item.id === "string" && /^[a-z0-9-]{1,40}$/i.test(item.id)
        ? item.id
        : "";
    if (!id || seen.has(id)) id = newBlockId(type as BlockType);
    seen.add(id);

    blocks.push({
      id,
      type: type as BlockType,
      hidden: item.hidden === true,
      props: normalizeProps(type as BlockType, item.props),
    } as Block);
  }

  return blocks;
}
