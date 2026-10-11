import type { Block } from "@/lib/blocks/types";

/**
 * Pesan antara editor (halaman induk) dan pratinjau langsung (iframe).
 * Keduanya satu origin; setiap penerima memeriksa `origin` dan pengirimnya.
 */

/** Editor -> pratinjau */
export type EditorMessage =
  | {
      source: "lensara-editor";
      type: "state";
      blocks: Block[];
      selectedId: string | null;
    }
  /** Gulir ke blok tertentu (saat dipilih dari daftar, bukan dari pratinjau) */
  | { source: "lensara-editor"; type: "scroll"; id: string };

/** Pratinjau -> editor */
export type PreviewMessage =
  | { source: "lensara-preview"; type: "ready" }
  | { source: "lensara-preview"; type: "select"; id: string }
  | { source: "lensara-preview"; type: "undo" }
  | { source: "lensara-preview"; type: "redo" };

export function isEditorMessage(data: unknown): data is EditorMessage {
  return (
    typeof data === "object" &&
    data !== null &&
    (data as { source?: unknown }).source === "lensara-editor"
  );
}

export function isPreviewMessage(data: unknown): data is PreviewMessage {
  return (
    typeof data === "object" &&
    data !== null &&
    (data as { source?: unknown }).source === "lensara-preview"
  );
}
