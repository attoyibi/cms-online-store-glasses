/**
 * Deskripsi kolom yang bisa diedit di tiap blok. Dipakai di dua tempat
 * sekaligus agar tidak pernah berbeda: form editor di admin (menentukan
 * input apa yang tampil) dan `normalize` (menentukan apa yang boleh
 * tersimpan dan bagaimana membersihkannya).
 */

type FieldBase = {
  name: string;
  label: string;
  help?: string;
};

export type SelectOption = { value: string; label: string };

export type Field = FieldBase &
  (
    | { kind: "text"; max?: number }
    | { kind: "textarea"; max?: number; rows?: number }
    /** Alamat tujuan: path situs ("/produk"), https://, mailto:, tel:, atau #anchor */
    | { kind: "link" }
    /** Path gambar situs atau URL Supabase Storage milik toko ini */
    | { kind: "image" }
    | { kind: "select"; options: readonly SelectOption[] }
    | { kind: "number"; min: number; max: number }
    | { kind: "icon" }
    /** Daftar teks pendek, mis. butir-butir keunggulan */
    | { kind: "strings"; max: number; itemLabel: string }
    /** Daftar objek berulang; `blank` = isi untuk item yang baru ditambah */
    | {
        kind: "list";
        max: number;
        itemLabel: string;
        fields: Field[];
        blank: Record<string, string>;
      }
  );

export const DEFAULT_TEXT_MAX = 200;
export const DEFAULT_TEXTAREA_MAX = 1500;
export const MAX_BLOCKS = 40;
