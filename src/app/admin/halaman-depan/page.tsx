import type { Metadata } from "next";
import Link from "next/link";

import {
  discardHomeDraft,
  publishHome,
  saveHomeDraft,
} from "@/app/admin/halaman-depan/actions";
import { PageEditor } from "@/components/admin/page-editor";
import { loadHomeEditorState } from "@/lib/data/admin-queries";

export const metadata: Metadata = { title: "Halaman Depan" };

export default async function HomePageEditorPage() {
  const state = await loadHomeEditorState();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Halaman Depan</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Atur isi dan susunan halaman depan toko. Perubahan disimpan sebagai
          draft dulu, dan baru terlihat pengunjung setelah Anda menekan
          Terbitkan.
        </p>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Tip: tulis <code className="font-mono">{"{kota}"}</code> atau{" "}
          <code className="font-mono">{"{toko}"}</code> di teks mana pun, dan
          otomatis diganti dengan kota dan nama toko dari{" "}
          <Link href="/admin/seo" className="font-medium underline">
            SEO &amp; Toko
          </Link>
          .
        </p>
      </div>

      <PageEditor
        initialBlocks={state.blocks}
        source={state.source}
        unpublished={state.unpublished}
        schemaReady={state.schemaReady}
        previewHref="/pratinjau"
        layout={state.layout}
        actions={{
          save: saveHomeDraft.bind(null, state.layout),
          publish: publishHome.bind(null, state.layout),
          discard: discardHomeDraft.bind(null, state.layout),
        }}
      />
    </div>
  );
}
