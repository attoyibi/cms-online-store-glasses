"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eraser,
  ExternalLink,
  Loader2,
  Redo2,
  RotateCcw,
  Save,
  Send,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";

import type { EditorResult } from "@/app/admin/halaman-depan/actions";
import { BlockOutline } from "@/components/admin/block-outline";
import { FieldInput } from "@/components/admin/block-fields";
import { PreviewPane } from "@/components/admin/preview-pane";
import { Button } from "@/components/ui/button";
import {
  canRedo,
  canUndo,
  commit,
  createHistory,
  redo,
  reset,
  undo,
  type History,
} from "@/lib/blocks/history";
import { createBlock, newBlockId } from "@/lib/blocks/normalize";
import {
  BLOCK_DEFS,
  defaultHomeBlocks,
  defaultPropsOf,
} from "@/lib/blocks/registry";
import { MAX_BLOCKS } from "@/lib/blocks/schema";
import type { Block, BlockType, PageSource } from "@/lib/blocks/types";
import { cn } from "@/lib/utils";

export type EditorActions = {
  save: (json: string) => Promise<EditorResult>;
  publish: (json: string) => Promise<EditorResult>;
  discard: () => Promise<EditorResult>;
};

type HistoryAction =
  | { type: "update"; update: (blocks: Block[]) => Block[]; key: string | null; now: number }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "reset"; blocks: Block[] };

function historyReducer(history: History, action: HistoryAction): History {
  switch (action.type) {
    case "update":
      return commit(history, action.update(history.present), action.key, action.now);
    case "undo":
      return undo(history);
    case "redo":
      return redo(history);
    case "reset":
      return reset(action.blocks);
  }
}

function move<T>(list: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

/** Pintasan keyboard undo/redo tidak boleh merebut Ctrl+Z milik kolom teks */
function isEditable(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    target.closest("input, textarea, select, [contenteditable='true']") !== null
  );
}

export function PageEditor({
  initialBlocks,
  source,
  unpublished: initialUnpublished,
  schemaReady,
  actions,
  previewHref,
  livePreviewSrc = "/pratinjau/langsung",
}: {
  initialBlocks: Block[];
  source: PageSource;
  unpublished: boolean;
  schemaReady: boolean;
  actions: EditorActions;
  /** Pratinjau draft di tab baru */
  previewHref: string;
  /** Halaman yang dimuat di iframe pratinjau langsung */
  livePreviewSrc?: string;
}) {
  const [history, dispatch] = useReducer(historyReducer, initialBlocks, createHistory);
  const blocks = history.present;

  const [savedJson, setSavedJson] = useState(() => JSON.stringify(initialBlocks));
  const [unpublished, setUnpublished] = useState(initialUnpublished);
  // Pernah diterbitkan (dari database atau dari sesi ini) — bukan lagi "bawaan"
  const [everPublished, setEverPublished] = useState(source !== "default");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<"outline" | "form">("outline");
  const [scrollRequest, setScrollRequest] = useState<{ id: string; n: number } | null>(null);
  const [formVersion, setFormVersion] = useState(0);
  const [feedback, setFeedback] = useState<
    { kind: "ok" | "error"; text: string } | null
  >(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLDivElement>(null);

  const json = useMemo(() => JSON.stringify(blocks), [blocks]);
  const dirty = json !== savedJson;
  const visibleCount = blocks.filter((block) => !block.hidden).length;
  const selected = blocks.find((block) => block.id === selectedId) ?? null;

  // Salinan terbaru riwayat, untuk tombol "Urungkan" di notifikasi
  const historyRef = useRef(history);
  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  const apply = useCallback(
    (update: (blocks: Block[]) => Block[], key: string | null = null) =>
      dispatch({ type: "update", update, key, now: Date.now() }),
    [],
  );

  // ------------------------------------------------------- undo / redo
  const doUndo = useCallback(() => {
    dispatch({ type: "undo" });
    setFormVersion((version) => version + 1);
  }, []);
  const doRedo = useCallback(() => {
    dispatch({ type: "redo" });
    setFormVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!(event.ctrlKey || event.metaKey) || isEditable(event.target)) return;
      const key = event.key.toLowerCase();
      if (key === "z" && !event.shiftKey) {
        event.preventDefault();
        doUndo();
      } else if (key === "y" || (key === "z" && event.shiftKey)) {
        event.preventDefault();
        doRedo();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [doUndo, doRedo]);

  // Peringatan bila menutup halaman saat ada perubahan yang belum disimpan
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // ------------------------------------------------------- pemilihan blok
  /** Dipilih dari pratinjau: buka form-nya, dan di layar sempit gulir ke sana */
  const selectFromPreview = useCallback((id: string) => {
    setSelectedId(id);
    setTab("form");
    if (window.matchMedia("(max-width: 1023px)").matches) {
      window.setTimeout(
        () => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
        50,
      );
    }
  }, []);

  /** Dipilih dari daftar: buka form-nya dan arahkan pratinjau ke blok itu */
  function selectFromOutline(id: string) {
    setSelectedId(id);
    setTab("form");
    setScrollRequest((current) => ({ id, n: (current?.n ?? 0) + 1 }));
  }

  // ------------------------------------------------------- operasi blok
  function setProp(id: string, name: string, value: unknown) {
    // Ketikan beruntun di kolom yang sama = satu langkah undo. Penambahan/
    // penghapusan item daftar mengubah panjangnya, jadi tercatat terpisah.
    const key = `prop:${id}:${name}:${Array.isArray(value) ? value.length : ""}`;
    apply(
      (current) =>
        current.map((block) =>
          block.id === id
            ? ({ ...block, props: { ...block.props, [name]: value } } as Block)
            : block,
        ),
      key,
    );
  }

  function addBlock(type: BlockType) {
    if (blocks.length >= MAX_BLOCKS) return;
    const block = createBlock(type);
    const after = selectedId;
    apply((current) => {
      const index = after ? current.findIndex((b) => b.id === after) : -1;
      const at = index >= 0 ? index + 1 : current.length;
      return [...current.slice(0, at), block, ...current.slice(at)];
    });
    setSelectedId(block.id);
    setTab("form");
    setScrollRequest((current) => ({ id: block.id, n: (current?.n ?? 0) + 1 }));
    setFeedback(null);
  }

  function duplicateBlock(id: string) {
    if (blocks.length >= MAX_BLOCKS) return;
    const source = blocks.find((block) => block.id === id);
    if (!source) return;
    const copy = { ...structuredClone(source), id: newBlockId(source.type) } as Block;
    apply((current) => {
      const index = current.findIndex((b) => b.id === id);
      if (index < 0) return current;
      return [...current.slice(0, index + 1), copy, ...current.slice(index + 1)];
    });
    setSelectedId(copy.id);
    setTab("form");
    setScrollRequest((current) => ({ id: copy.id, n: (current?.n ?? 0) + 1 }));
  }

  function removeBlock(block: Block) {
    const next = blocks.filter((b) => b.id !== block.id);
    apply(() => next);
    if (selectedId === block.id) setSelectedId(null);

    // Tanpa konfirmasi: hapus bisa dibatalkan. Tombol di notifikasi hanya
    // bekerja bila belum ada perubahan lain sesudahnya.
    toast(`Blok "${BLOCK_DEFS[block.type].label}" dihapus`, {
      action: {
        label: "Urungkan",
        onClick: () => {
          if (historyRef.current.present === next) {
            doUndo();
          } else {
            toast("Sudah ada perubahan lain — pakai tombol Urungkan di atas.");
          }
        },
      },
    });
  }

  function toggleHidden(id: string) {
    apply((current) =>
      current.map((block) =>
        block.id === id ? ({ ...block, hidden: !block.hidden } as Block) : block,
      ),
    );
  }

  function moveBlock(index: number, direction: -1 | 1) {
    apply((current) => move(current, index, direction));
  }

  function resetBlock(block: Block) {
    apply((current) =>
      current.map((b) =>
        b.id === block.id
          ? ({ ...b, props: defaultPropsOf(b.type) } as Block)
          : b,
      ),
    );
    setFormVersion((version) => version + 1);
    toast(`Blok "${BLOCK_DEFS[block.type].label}" dikembalikan ke bawaan`);
  }

  function resetAll() {
    apply(() => defaultHomeBlocks());
    setSelectedId(null);
    setTab("outline");
    setFormVersion((version) => version + 1);
    setFeedback(null);
    toast("Susunan dan teks dikembalikan ke bawaan. Belum disimpan — bisa diurungkan.");
  }

  // ------------------------------------------------ simpan / terbitkan
  function run(
    action: () => Promise<EditorResult>,
    onSuccess?: (result: EditorResult) => void,
  ) {
    setFeedback(null);
    startTransition(async () => {
      try {
        const result = await action();
        if (result.ok) {
          setFeedback({ kind: "ok", text: result.message ?? "Berhasil." });
          onSuccess?.(result);
        } else {
          setFeedback({ kind: "error", text: result.error ?? "Terjadi kesalahan." });
        }
      } catch {
        setFeedback({
          kind: "error",
          text: "Tidak bisa menghubungi server. Periksa koneksi lalu coba lagi.",
        });
      }
    });
  }

  function saveDraft() {
    const snapshot = json;
    run(
      () => actions.save(snapshot),
      () => {
        setSavedJson(snapshot);
        setUnpublished(true);
      },
    );
  }

  function publish() {
    if (visibleCount === 0) {
      setFeedback({
        kind: "error",
        text: "Semua blok disembunyikan — halaman depan akan kosong. Tampilkan minimal satu blok sebelum menerbitkan.",
      });
      return;
    }
    const snapshot = json;
    run(
      () => actions.publish(snapshot),
      () => {
        setSavedJson(snapshot);
        setUnpublished(false);
        setEverPublished(true);
      },
    );
  }

  function discard() {
    // Satu-satunya tindakan yang tidak bisa diurungkan: draft di server ikut dibuang
    if (!window.confirm("Buang semua perubahan, termasuk draft yang sudah disimpan, dan kembali ke versi yang sedang terbit? Ini tidak bisa diurungkan.")) {
      return;
    }
    run(actions.discard, (result) => {
      const restored = result.blocks ?? defaultHomeBlocks();
      dispatch({ type: "reset", blocks: restored });
      setSavedJson(JSON.stringify(restored));
      setUnpublished(false);
      setSelectedId(null);
      setTab("outline");
      setFormVersion((version) => version + 1);
    });
  }

  const status = dirty
    ? { text: "Ada perubahan yang belum disimpan", tone: "text-amber-700 bg-amber-50 border-amber-200" }
    : unpublished
      ? { text: "Draft tersimpan — belum diterbitkan", tone: "text-blue-700 bg-blue-50 border-blue-200" }
      : !everPublished
        ? { text: "Tampilan bawaan (belum pernah diedit)", tone: "text-muted-foreground bg-muted border-border" }
        : { text: "Sudah terbit", tone: "text-green-700 bg-green-50 border-green-200" };

  const definition = selected ? BLOCK_DEFS[selected.type] : null;

  return (
    <div className="space-y-4" data-admin-wide>
      {!schemaReady && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
          <span>
            Tabel halaman belum dibuat di Supabase, jadi perubahan belum bisa
            disimpan. Jalankan{" "}
            <code className="font-mono">supabase/v5/01_site_pages.sql</code>{" "}
            di SQL Editor, lalu muat ulang halaman ini.
          </span>
        </p>
      )}

      {/* ------------------------------------------------------ toolbar */}
      <div className="sticky top-0 z-20 -mx-5 flex flex-wrap items-center gap-2 border-b bg-background/95 px-5 py-2.5 backdrop-blur sm:-mx-8 sm:px-8">
        <span className={cn("rounded-full border px-3 py-1 text-xs font-medium", status.tone)}>
          {status.text}
        </span>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={doUndo}
            disabled={!canUndo(history)}
            title="Urungkan (Ctrl+Z)"
            aria-label="Urungkan"
            className="gap-1.5"
          >
            <Undo2 className="size-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Urungkan</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={doRedo}
            disabled={!canRedo(history)}
            title="Ulangi (Ctrl+Shift+Z)"
            aria-label="Ulangi"
            className="gap-1.5"
          >
            <Redo2 className="size-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Ulangi</span>
          </Button>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={discard}
            disabled={pending || !schemaReady}
            className="gap-1.5"
          >
            <Eraser className="size-3.5" aria-hidden="true" />
            Buang perubahan
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={resetAll}
            disabled={pending}
            className="gap-1.5"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            Kembalikan bawaan
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href={previewHref} target="_blank" rel="noreferrer" className="gap-1.5" title="Buka draft yang sudah disimpan di tab baru">
              <ExternalLink className="size-3.5" aria-hidden="true" />
              Tab baru
            </a>
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={saveDraft}
            disabled={pending || !dirty || !schemaReady}
            className="gap-1.5"
          >
            {pending ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="size-3.5" aria-hidden="true" />
            )}
            Simpan draft
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={publish}
            disabled={pending || !schemaReady || (!dirty && !unpublished)}
            className="gap-1.5"
          >
            <Send className="size-3.5" aria-hidden="true" />
            Terbitkan
          </Button>
        </div>
      </div>

      {feedback && (
        <p
          role={feedback.kind === "error" ? "alert" : "status"}
          className={cn(
            "flex items-start gap-2 rounded-lg border p-3 text-sm",
            feedback.kind === "error"
              ? "border-destructive/30 bg-destructive/5 text-destructive"
              : "border-green-200 bg-green-50 text-green-800",
          )}
        >
          {feedback.kind === "error" ? (
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          )}
          {feedback.text}
        </p>
      )}

      {visibleCount === 0 && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Semua blok sedang disembunyikan, jadi halaman depan akan kosong.
        </p>
      )}

      {/* ----------------------------------------- pratinjau + panel kiri */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        {/* Pratinjau di atas pada layar sempit, di kanan pada layar lebar */}
        <div className="h-[62dvh] min-h-80 lg:sticky lg:top-[4.25rem] lg:col-start-2 lg:row-start-1 lg:h-[calc(100dvh-6.5rem)]">
          <PreviewPane
            src={livePreviewSrc}
            blocks={blocks}
            selectedId={selectedId}
            scrollRequest={scrollRequest}
            onSelect={selectFromPreview}
            onUndo={doUndo}
            onRedo={doRedo}
          />
        </div>

        <aside className="min-w-0 space-y-3 lg:col-start-1 lg:row-start-1 lg:max-h-[calc(100dvh-6.5rem)] lg:overflow-y-auto lg:pr-1">
          <div role="tablist" aria-label="Panel editor" className="grid grid-cols-2 gap-1 rounded-xl border bg-muted/50 p-1">
            {(
              [
                { id: "outline", label: "Susunan halaman" },
                { id: "form", label: "Pengaturan blok" },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={tab === item.id}
                onClick={() => setTab(item.id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  tab === item.id
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {tab === "outline" ? (
            <BlockOutline
              blocks={blocks}
              selectedId={selectedId}
              onSelect={selectFromOutline}
              onMove={moveBlock}
              onToggleHidden={toggleHidden}
              onDuplicate={duplicateBlock}
              onRemove={removeBlock}
              onAdd={addBlock}
            />
          ) : selected && definition ? (
            <div
              ref={formRef}
              key={`${selected.id}-${formVersion}`}
              className="space-y-5 rounded-xl border bg-card p-4"
            >
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setTab("outline")}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="size-3" aria-hidden="true" />
                  Susunan halaman
                </button>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">{definition.label}</h2>
                    <p className="text-sm text-muted-foreground">
                      {definition.description}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => resetBlock(selected)}
                  className="gap-1.5"
                >
                  <RotateCcw className="size-3.5" aria-hidden="true" />
                  Kembalikan blok ini ke bawaan
                </Button>
              </div>

              {definition.fields.map((field) => (
                <FieldInput
                  key={field.name}
                  field={field}
                  idPrefix={selected.id}
                  value={(selected.props as Record<string, unknown>)[field.name]}
                  onChange={(value) => setProp(selected.id, field.name, value)}
                />
              ))}
            </div>
          ) : (
            <div className="flex min-h-56 flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-6 text-center">
              <p className="font-medium">Pilih sebuah blok untuk mengeditnya</p>
              <p className="max-w-xs text-sm text-muted-foreground">
                Klik bagian mana pun di pratinjau, atau pilih dari tab
                &ldquo;Susunan halaman&rdquo;. Setiap perubahan langsung terlihat,
                dan bisa diurungkan.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
