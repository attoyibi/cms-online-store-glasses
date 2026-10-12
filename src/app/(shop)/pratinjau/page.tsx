import type { Metadata } from "next";
import Link from "next/link";

import { BlockRenderer } from "@/components/blocks/block-renderer";
import { loadHomeEditorState } from "@/lib/data/admin-queries";

export const metadata: Metadata = {
  title: "Pratinjau halaman depan",
  robots: { index: false, follow: false },
};

/**
 * Pratinjau draft halaman depan. Hanya untuk admin yang sedang login —
 * `loadHomeEditorState` mengarahkan ke halaman masuk bila bukan.
 */
export default async function PreviewPage() {
  const state = await loadHomeEditorState();

  return (
    <>
      <div className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-2 bg-amber-100 px-5 py-2 text-sm text-amber-900">
        <span>
          <strong>Pratinjau</strong> —{" "}
          {state.source === "draft"
            ? "ini draft Anda. Pengunjung belum melihatnya."
            : "belum ada draft; ini tampilan yang sedang terbit."}
        </span>
        <Link
          href="/admin/halaman-depan"
          className="font-medium underline underline-offset-2"
        >
          Kembali ke editor
        </Link>
      </div>
      <BlockRenderer blocks={state.blocks} />
    </>
  );
}
