"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BLOCK_DEFS, BLOCK_TYPES } from "@/lib/blocks/registry";
import { MAX_BLOCKS } from "@/lib/blocks/schema";
import type { Block, BlockType } from "@/lib/blocks/types";
import { cn } from "@/lib/utils";

const selectClass =
  "h-9 min-w-0 flex-1 rounded-lg border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

/** Cuplikan isi blok untuk daftar, supaya blok sejenis mudah dibedakan */
export function summaryOf(block: Block): string {
  const props = block.props as Record<string, unknown>;
  const text = (key: string) =>
    typeof props[key] === "string" ? (props[key] as string) : "";

  const direct = [
    text("title"),
    `${text("titleLine1")} ${text("titleHighlight")}`.trim(),
  ].find((candidate) => candidate.length > 0);
  if (direct) return direct;

  // Blok tanpa judul sendiri (mis. bar keunggulan): ambil dari isi daftar pertama
  for (const value of Object.values(props)) {
    if (!Array.isArray(value) || value.length === 0) continue;
    const item = value[0];
    if (typeof item === "string" && item) return item;
    if (item && typeof item === "object") {
      const firstText = Object.values(item).find(
        (v) =>
          typeof v === "string" && v.length > 0 && !/^[a-z]+(-[a-z]+)*$/.test(v),
      );
      if (typeof firstText === "string") return firstText;
    }
  }
  return text("eyebrow");
}

/**
 * Daftar susunan blok + kotak "tambah blok". Pemilihan blok juga bisa
 * dilakukan dengan mengeklik langsung di pratinjau.
 */
export function BlockOutline({
  blocks,
  selectedId,
  onSelect,
  onMove,
  onToggleHidden,
  onDuplicate,
  onRemove,
  onAdd,
}: {
  blocks: Block[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onToggleHidden: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRemove: (block: Block) => void;
  onAdd: (type: BlockType) => void;
}) {
  const [newType, setNewType] = useState<BlockType>("product-showcase");
  const full = blocks.length >= MAX_BLOCKS;

  return (
    <section aria-label="Susunan halaman" className="space-y-3">
      <div className="space-y-2 rounded-xl border bg-card p-3">
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
            onClick={() => onAdd(newType)}
            disabled={full}
            className="h-9 gap-1.5"
          >
            <Plus className="size-3.5" aria-hidden="true" />
            Tambah
          </Button>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {BLOCK_DEFS[newType].description}{" "}
          {selectedId
            ? "Masuk tepat di bawah blok yang sedang dipilih."
            : "Masuk di paling bawah."}
        </p>
      </div>

      <ol className="space-y-1.5">
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
                onClick={() => onSelect(block.id)}
                aria-current={active ? "true" : undefined}
                className="block w-full rounded-t-xl px-3 pb-1 pt-2.5 text-left outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring"
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

              <div className="flex items-center gap-0.5 px-1.5 pb-1.5">
                <IconButton
                  label={`Naikkan blok ${index + 1}`}
                  disabled={index === 0}
                  onClick={() => onMove(index, -1)}
                >
                  <ArrowUp className="size-3.5" aria-hidden="true" />
                </IconButton>
                <IconButton
                  label={`Turunkan blok ${index + 1}`}
                  disabled={index === blocks.length - 1}
                  onClick={() => onMove(index, 1)}
                >
                  <ArrowDown className="size-3.5" aria-hidden="true" />
                </IconButton>
                <IconButton
                  label={
                    block.hidden
                      ? `Tampilkan blok ${index + 1}`
                      : `Sembunyikan blok ${index + 1}`
                  }
                  onClick={() => onToggleHidden(block.id)}
                >
                  {block.hidden ? (
                    <Eye className="size-3.5" aria-hidden="true" />
                  ) : (
                    <EyeOff className="size-3.5" aria-hidden="true" />
                  )}
                </IconButton>
                <IconButton
                  label={`Duplikasi blok ${index + 1}`}
                  disabled={full}
                  onClick={() => onDuplicate(block.id)}
                >
                  <Copy className="size-3.5" aria-hidden="true" />
                </IconButton>
                <span className="flex-1" />
                <IconButton
                  label={`Hapus blok ${index + 1}`}
                  danger
                  onClick={() => onRemove(block)}
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                </IconButton>
              </div>
            </li>
          );
        })}
      </ol>

      {blocks.length === 0 && (
        <p className="rounded-xl border border-dashed p-5 text-center text-sm text-muted-foreground">
          Belum ada blok. Tambahkan dari kotak di atas, atau tekan
          &ldquo;Kembalikan bawaan&rdquo;.
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        {blocks.length} dari {MAX_BLOCKS} blok.
      </p>
    </section>
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
