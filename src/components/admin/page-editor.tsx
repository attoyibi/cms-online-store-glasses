"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  Loader2,
  Plus,
  RotateCcw,
  Save,
  Send,
  Trash2,
  Undo2,
} from "lucide-react";

import type { EditorResult } from "@/app/admin/halaman-depan/actions";
import { FieldInput } from "@/components/admin/block-fields";
import { Button } from "@/components/ui/button";
import { createBlock, newBlockId } from "@/lib/blocks/normalize";
import {
  BLOCK_DEFS,
  BLOCK_TYPES,
  defaultHomeBlocks,
} from "@/lib/blocks/registry";
import { MAX_BLOCKS } from "@/lib/blocks/schema";
import type { Block, BlockType, PageSource } from "@/lib/blocks/types";
import { cn } from "@/lib/utils";

export type EditorActions = {
  save: (json: string) => Promise<EditorResult>;
  publish: (json: string) => Promise<EditorResult>;
  discard: () => Promise<EditorResult>;
};

const selectClass =
  "h-9 min-w-0 flex-1 rounded-lg border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

/** Cuplikan isi blok untuk daftar, supaya blok sejenis mudah dibedakan */
function summaryOf(block: Block): string {
  const props = block.props as Record<string, unknown>;
  const text = (key: string) =>
    typeof props[key] === "string" ? (props[key] as string) : "";

  const direct = [text("title"), `${text("titleLine1")} ${text("titleHighlight")}`.trim()]
    .find((candidate) => candidate.length > 0);
  if (direct) return direct;

  // Blok tanpa judul sendiri (mis. bar keunggulan): ambil dari isi daftar pertama
  for (const value of Object.values(props)) {
    if (!Array.isArray(value) || value.length === 0) continue;
    const item = value[0];
    if (typeof item === "string" && item) return item;
    if (item && typeof item === "object") {
      const firstText = Object.values(item).find(
        (v) => typeof v === "string" && v.length > 0 && !/^[a-z]+(-[a-z]+)*$/.test(v),
      );
      if (typeof firstText === "string") return firstText;
    }
  }
  return text("eyebrow");
}

function move<T>(list: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function PageEditor({
  initialBlocks,
  source,
  unpublished: initialUnpublished,
  schemaReady,
  actions,
  previewHref,
}: {
  initialBlocks: Block[];
  source: PageSource;
  unpublished: boolean;
  schemaReady: boolean;
  actions: EditorActions;
  previewHref: string;
}) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [savedJson, setSavedJson] = useState(() => JSON.stringify(initialBlocks));
  const [unpublished, setUnpublished] = useState(initialUnpublished);
  // Pernah diterbitkan (dari database atau dari sesi ini) — bukan lagi "bawaan"
  const [everPublished, setEverPublished] = useState(source !== "default");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newType, setNewType] = useState<BlockType>("product-showcase");
  const [formVersion, setFormVersion] = useState(0);
  const [feedback, setFeedback] = useState<
    { kind: "ok" | "error"; text: string } | null
  >(null);
  const [pending, startTransition] = useTransition();

  const json = useMemo(() => JSON.stringify(blocks), [blocks]);
  const dirty = json !== savedJson;
  const visibleCount = blocks.filter((block) => !block.hidden).length;
  const selected = blocks.find((block) => block.id === selectedId) ?? null;

  // Peringatan bila menutup halaman saat ada perubahan yang belum disimpan
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function setProp(id: string, name: string, value: unknown) {
    setBlocks((current) =>
      current.map((block) =>
        block.id === id
          ? ({ ...block, props: { ...block.props, [name]: value } } as Block)
          : block,
      ),
    );
  }

  function addBlock() {
    if (blocks.length >= MAX_BLOCKS) return;
    const block = createBlock(newType);
    const at = selected ? blocks.findIndex((b) => b.id === selected.id) + 1 : blocks.length;
    setBlocks([...blocks.slice(0, at), block, ...blocks.slice(at)]);
    setSelectedId(block.id);
    setFeedback(null);
  }

  function duplicateBlock(id: string) {
    if (blocks.length >= MAX_BLOCKS) return;
    const index = blocks.findIndex((block) => block.id === id);
    if (index < 0) return;
    const copy = {
      ...structuredClone(blocks[index]),
      id: newBlockId(blocks[index].type),
    } as Block;
    setBlocks([...blocks.slice(0, index + 1), copy, ...blocks.slice(index + 1)]);
    setSelectedId(copy.id);
  }

  function removeBlock(block: Block) {
    const label = BLOCK_DEFS[block.type].label;
    if (!window.confirm(`Hapus blok "${label}"? Ini bisa dibatalkan dengan tombol "Buang perubahan" selama belum disimpan.`)) {
      return;
    }
    setBlocks((current) => current.filter((b) => b.id !== block.id));
    if (selectedId === block.id) setSelectedId(null);
  }

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
    if (!window.confirm("Buang semua perubahan dan kembali ke versi yang sedang terbit?")) {
      return;
    }
    run(actions.discard, (result) => {
      const restored = result.blocks ?? defaultHomeBlocks();
      setBlocks(restored);
      setSavedJson(JSON.stringify(restored));
      setUnpublished(false);
      setSelectedId(null);
      setFormVersion((version) => version + 1);
    });
  }

  function resetToDefault() {
    if (!window.confirm("Kembalikan susunan dan semua teks ke bawaan awal? Belum disimpan sampai Anda menekan Simpan draft.")) {
      return;
    }
    setBlocks(defaultHomeBlocks());
    setSelectedId(null);
    setFormVersion((version) => version + 1);
    setFeedback(null);
  }

  const status = dirty
    ? { text: "Ada perubahan yang belum disimpan", tone: "text-amber-700 bg-amber-50 border-amber-200" }
    : unpublished
      ? { text: "Draft tersimpan — belum diterbitkan", tone: "text-blue-700 bg-blue-50 border-blue-200" }
      : !everPublished
        ? { text: "Tampilan bawaan (belum pernah diedit)", tone: "text-muted-foreground bg-muted border-border" }
        : { text: "Sudah terbit", tone: "text-green-700 bg-green-50 border-green-200" };

  return (
    <div className="space-y-5">
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

      <div className="sticky top-0 z-20 -mx-5 flex flex-wrap items-center gap-3 border-b bg-background/95 px-5 py-3 backdrop-blur sm:-mx-8 sm:px-8">
        <span className={cn("rounded-full border px-3 py-1 text-xs font-medium", status.tone)}>
          {status.text}
        </span>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={discard}
            disabled={pending || !schemaReady}
            className="gap-1.5"
          >
            <Undo2 className="size-3.5" aria-hidden="true" />
            Buang perubahan
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={resetToDefault}
            disabled={pending}
            className="gap-1.5"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            Kembalikan bawaan
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href={previewHref} target="_blank" rel="noreferrer" className="gap-1.5">
              <ExternalLink className="size-3.5" aria-hidden="true" />
              Pratinjau
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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,23rem)_minmax(0,1fr)]">
        {/* ------------------------------------------------ daftar blok */}
        <section aria-label="Daftar blok" className="space-y-4">
          <div className="space-y-2 rounded-xl border bg-card p-3.5">
            <label htmlFor="new-block-type" className="text-sm font-medium">
              Tambah blok baru
            </label>
            <div className="flex gap-2">
              <select
                id="new-block-type"
                value={newType}
                onChange={(event) => setNewType(event.target.value as BlockType)}
                className={selectClass}
              >
                {BLOCK_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {BLOCK_DEFS[type].label}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                size="sm"
                onClick={addBlock}
                disabled={blocks.length >= MAX_BLOCKS}
                className="h-9 gap-1.5"
              >
                <Plus className="size-3.5" aria-hidden="true" />
                Tambah
              </Button>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {BLOCK_DEFS[newType].description}{" "}
              {selected
                ? "Blok baru masuk tepat di bawah blok yang sedang dipilih."
                : "Blok baru masuk di paling bawah."}
            </p>
          </div>

          <ol className="space-y-2">
            {blocks.map((block, index) => {
              const definition = BLOCK_DEFS[block.type];
              const active = block.id === selectedId;
              return (
                <li
                  key={block.id}
                  className={cn(
                    "rounded-xl border bg-card transition-colors",
                    active && "border-primary ring-1 ring-primary",
                    block.hidden && "opacity-60",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedId(block.id)}
                    aria-current={active ? "true" : undefined}
                    className="block w-full rounded-t-xl px-3.5 pb-1.5 pt-3 text-left outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <span className="tabular-nums text-muted-foreground">
                        {index + 1}.
                      </span>
                      {definition.label}
                      {block.hidden && (
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                          Disembunyikan
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 line-clamp-1 block text-xs text-muted-foreground">
                      {summaryOf(block) || "—"}
                    </span>
                  </button>

                  <div className="flex items-center gap-0.5 px-2 pb-2">
                    <IconButton
                      label={`Naikkan blok ${index + 1}`}
                      disabled={index === 0}
                      onClick={() => setBlocks(move(blocks, index, -1))}
                    >
                      <ArrowUp className="size-3.5" aria-hidden="true" />
                    </IconButton>
                    <IconButton
                      label={`Turunkan blok ${index + 1}`}
                      disabled={index === blocks.length - 1}
                      onClick={() => setBlocks(move(blocks, index, 1))}
                    >
                      <ArrowDown className="size-3.5" aria-hidden="true" />
                    </IconButton>
                    <IconButton
                      label={block.hidden ? `Tampilkan blok ${index + 1}` : `Sembunyikan blok ${index + 1}`}
                      onClick={() =>
                        setBlocks(
                          blocks.map((b) =>
                            b.id === block.id ? ({ ...b, hidden: !b.hidden } as Block) : b,
                          ),
                        )
                      }
                    >
                      {block.hidden ? (
                        <Eye className="size-3.5" aria-hidden="true" />
                      ) : (
                        <EyeOff className="size-3.5" aria-hidden="true" />
                      )}
                    </IconButton>
                    <IconButton
                      label={`Duplikasi blok ${index + 1}`}
                      disabled={blocks.length >= MAX_BLOCKS}
                      onClick={() => duplicateBlock(block.id)}
                    >
                      <Copy className="size-3.5" aria-hidden="true" />
                    </IconButton>
                    <span className="flex-1" />
                    <IconButton
                      label={`Hapus blok ${index + 1}`}
                      danger
                      onClick={() => removeBlock(block)}
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" />
                    </IconButton>
                  </div>
                </li>
              );
            })}
          </ol>

          {blocks.length === 0 && (
            <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              Belum ada blok. Tambahkan dari kotak di atas, atau tekan
              &ldquo;Kembalikan bawaan&rdquo;.
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {blocks.length} dari {MAX_BLOCKS} blok. Pratinjau menampilkan draft
            yang sudah disimpan.
          </p>
        </section>

        {/* ------------------------------------------------- form blok */}
        <section aria-label="Pengaturan blok" className="min-w-0">
          {selected ? (
            <div
              key={`${selected.id}-${formVersion}`}
              className="space-y-5 rounded-xl border bg-card p-5"
            >
              <div>
                <h2 className="text-lg font-semibold">
                  {BLOCK_DEFS[selected.type].label}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {BLOCK_DEFS[selected.type].description}
                </p>
              </div>

              {BLOCK_DEFS[selected.type].fields.map((field) => (
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
            <div className="flex min-h-64 flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-8 text-center">
              <p className="font-medium">Pilih sebuah blok untuk mengeditnya</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Klik salah satu blok di daftar. Anda bisa mengubah teks, gambar,
                dan tautannya di sini, atau mengatur urutan dan
                menyembunyikannya dari tombol di bawah tiap blok.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30",
        danger && "hover:bg-destructive/10 hover:text-destructive",
      )}
    >
      {children}
    </button>
  );
}
