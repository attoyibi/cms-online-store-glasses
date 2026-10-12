import type { Block } from "@/lib/blocks/types";

/**
 * Riwayat undo/redo untuk susunan blok — murni (tanpa React) agar mudah diuji.
 *
 * `present` adalah keadaan sekarang, `past` yang bisa di-undo, `future`
 * yang bisa di-redo. Perubahan beruntun pada kolom yang sama dalam waktu
 * singkat (mis. mengetik satu judul) digabung menjadi SATU langkah, jadi
 * satu kali undo membatalkan satu kali "mengedit judul", bukan satu huruf.
 */

export type History = {
  past: Block[][];
  present: Block[];
  future: Block[][];
  /** Kunci perubahan terakhir, untuk menggabungkan ketikan beruntun */
  lastKey: string | null;
  lastAt: number;
};

export const MAX_HISTORY = 100;
/** Ketikan pada kolom yang sama dalam jeda ini dianggap satu langkah */
export const COALESCE_MS = 1000;

export function createHistory(initial: Block[]): History {
  return { past: [], present: initial, future: [], lastKey: null, lastAt: 0 };
}

/**
 * Catat keadaan baru. `key` (opsional) menggabungkan perubahan beruntun yang
 * sejenis. Mengembalikan objek yang sama bila tidak ada perubahan.
 */
export function commit(
  history: History,
  next: Block[],
  key: string | null,
  now: number,
): History {
  if (next === history.present) return history;

  const merge =
    key !== null &&
    key === history.lastKey &&
    now - history.lastAt < COALESCE_MS &&
    history.past.length > 0;

  if (merge) {
    // Ganti keadaan sekarang tanpa menambah langkah baru
    return { ...history, present: next, future: [], lastAt: now };
  }

  return {
    past: [...history.past, history.present].slice(-MAX_HISTORY),
    present: next,
    future: [],
    lastKey: key,
    lastAt: now,
  };
}

export function undo(history: History): History {
  const previous = history.past.at(-1);
  if (!previous) return history;
  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future],
    lastKey: null,
    lastAt: 0,
  };
}

export function redo(history: History): History {
  const [next, ...rest] = history.future;
  if (!next) return history;
  return {
    past: [...history.past, history.present],
    present: next,
    future: rest,
    lastKey: null,
    lastAt: 0,
  };
}

/** Ganti seluruh isi dan kosongkan riwayat (mis. setelah "Buang perubahan") */
export function reset(blocks: Block[]): History {
  return createHistory(blocks);
}

export const canUndo = (history: History) => history.past.length > 0;
export const canRedo = (history: History) => history.future.length > 0;
